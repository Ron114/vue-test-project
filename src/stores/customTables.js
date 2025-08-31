import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localDatabaseService } from '../services/localDatabaseService.js'

export const useCustomTablesStore = defineStore('customTables', () => {
  // State
  const customTables = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null)

  // API Configuration
  const API_BASE_URL = 'https://srv03.nopcoders.com'

  const hasTables = computed(() => customTables.value.length > 0)
  const isEmpty = computed(() => !loading.value && !error.value && customTables.value.length === 0)

  // Actions
  const fetchCustomTables = async (forceRefresh = false) => {
    if (!forceRefresh && customTables.value.length > 0 && lastFetched.value) {
      const timeSinceLastFetch = Date.now() - lastFetched.value
      if (timeSinceLastFetch < 5 * 60 * 1000) {
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const localData = await localDatabaseService.loadDatabase()
      if (localData.customTables && localData.customTables.length > 0) {
        customTables.value = localData.customTables
        lastFetched.value = Date.now()
        loading.value = false
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}/dtables/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response: expected an array')
      }

      const transformedTables = data.map(table => {
        if (!table.id || !table.name) {
          console.warn('Skipping table with missing required fields:', table)
          return null
        }

        return {
          id: table.id,
          config_id: table.id,
          user_id: table.user_id || null,
          name: table.name,
          table_name: table.name,
          internal_table: table.internal_table || null,
          created_at: table.created_at || null
        }
      }).filter(Boolean)

      customTables.value = transformedTables
      lastFetched.value = Date.now()

    } catch (err) {
      if (err.name === 'AbortError') {
        error.value = 'Request timed out. Please try again.'
      } else if (err.message.includes('Failed to fetch')) {
        error.value = 'Network error. Please check your connection and try again.'
      } else if (err.message.includes('CORS')) {
        error.value = 'CORS error. The API server may not allow requests from this origin.'
      } else if (err.message.includes('NetworkError')) {
        error.value = 'Network error. Please check your internet connection.'
      } else {
        error.value = err.message
      }

      try {
        const localData = await localDatabaseService.loadDatabase()
        if (localData.customTables && localData.customTables.length > 0) {
          customTables.value = localData.customTables
          lastFetched.value = Date.now()
          error.value = null
        } else {
          customTables.value = []
        }
      } catch (localError) {
        console.warn('Failed to load local database:', localError)
        customTables.value = []
      }
    } finally {
      loading.value = false
    }
  }

  // Refresh custom tables
  const refreshCustomTables = async () => {
    return await fetchCustomTables(true)
  }

  // Get custom table by id
  const getCustomTableById = (id) => {
    return customTables.value.find(table => table.id === id)
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Clear data
  const clearData = () => {
    customTables.value = []
    lastFetched.value = null
    error.value = null
  }

  return {
    customTables,
    loading,
    error,
    lastFetched,

    hasTables,
    isEmpty,

    fetchCustomTables,
    refreshCustomTables,
    getCustomTableById,
    clearError,
    clearData
  }
})
