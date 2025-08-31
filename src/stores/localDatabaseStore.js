import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localDatabaseService } from '../services/localDatabaseService.js'

export const useLocalDatabaseStore = defineStore('localDatabase', () => {
  // State
  const entities = ref([])
  const customTables = ref([])
  const customTableColumns = ref([])
  const customTableData = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastLoaded = ref(null)
  const isInitialized = ref(false)

  // Computed
  const hasData = computed(() => entities.value.length > 0 || customTables.value.length > 0)

  // Actions
  const loadDatabase = async (forceRefresh = false) => {
    if (!forceRefresh && hasData.value && lastLoaded.value) {
      const age = Date.now() - lastLoaded.value
      if (age < localDatabaseService.cacheExpiry) {
        return {
          entities: entities.value,
          customTables: customTables.value,
          customTableColumns: customTableColumns.value,
          customTableData: customTableData.value
        }
      }
    }

    loading.value = true
    error.value = null

    try {
      const data = await localDatabaseService.loadDatabase(forceRefresh)
      
      entities.value = data.entities || []
      customTables.value = data.customTables || []
      customTableColumns.value = data.customTableColumns || []
      customTableData.value = data.customTableData || []
      
      lastLoaded.value = Date.now()
      isInitialized.value = true

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error loading local database:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize the store
  const initStore = async () => {
    if (!isInitialized.value) {
      await loadDatabase()
    }
  }

  return {
    // State
    entities,
    customTables,
    customTableColumns,
    customTableData,
    loading,
    error,
    lastLoaded,
    isInitialized,

    // Computed
    hasData,

    // Actions
    loadDatabase,
    initStore
  }
})
