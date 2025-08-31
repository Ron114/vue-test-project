import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { demoEntities } from '../demo-data.js'
import { localDatabaseService } from '../services/localDatabaseService.js'

export const useEntitiesStore = defineStore('entities', () => {
  // State
  const entities = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')
  const columnFilters = ref({})
  const sortBy = ref('')
  const sortDir = ref('asc')
  const currentPage = ref(1)
  const pageSize = ref(25)
  const totalItems = ref(0)
  const lastFetched = ref(null)
  const searchTimeout = ref(null)
  const useDemoData = ref(false)
  const isInitialized = ref(false)

  // API Configuration
  const API_BASE_URL = 'https://srv03.nopcoders.com'

  // Computed
  const filteredEntities = computed(() => {
    if (!useDemoData.value) {
      return entities.value
    }

    let filtered = [...entities.value]

    if (searchTerm.value && searchTerm.value.trim()) {
      const term = searchTerm.value.toLowerCase().trim()
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          value && value.toString().toLowerCase().includes(term)
        )
      )
    }

    Object.entries(columnFilters.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        const filterTerm = value.toLowerCase().trim()
        filtered = filtered.filter(entity => {
          const cellValue = entity[key]
          if (!cellValue) return false
          return cellValue.toString().toLowerCase().includes(filterTerm)
        })
      }
    })

    if (sortBy.value && sortDir.value) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy.value] || ''
        const bVal = b[sortBy.value] || ''

        if (sortDir.value === 'asc') {
          return aVal.toString().localeCompare(bVal.toString())
        } else {
          return bVal.toString().localeCompare(aVal.toString())
        }
      })
    }

    return filtered
  })

  // Paginated entities
  const paginatedEntities = computed(() => {
    if (!useDemoData.value) {
      return entities.value
    }

    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    const paginated = filteredEntities.value.slice(start, end)

    return paginated
  })

  // Get search statistics
  const getSearchStats = computed(() => {
    const totalResults = useDemoData.value ? filteredEntities.value.length : totalItems.value
    const hasActiveFilters = searchTerm.value || Object.values(columnFilters.value).some(v => v && v.trim())

    return {
      totalResults,
      hasActiveFilters,
      searchTerm: searchTerm.value,
      activeColumnFilters: Object.entries(columnFilters.value)
        .filter(([_, value]) => value && value.trim())
        .map(([key, value]) => ({ column: value }))
    }
  })

  // Debounce search
  const debounceSearch = (func, delay) => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(func, delay)
  }

  // Initialize store
  const initStore = async () => {
    isInitialized.value = true

    if (entities.value.length === 0) {
      await loadDemoData()
    }
  }

  // Load demo data as fallback
  const loadDemoData = async () => {
    try {
      const localData = await localDatabaseService.loadDatabase()
      if (localData.entities && localData.entities.length > 0) {
        entities.value = [...localData.entities]
        totalItems.value = localData.entities.length
        useDemoData.value = true
        lastFetched.value = Date.now()
        loading.value = false
        error.value = null
        return
      }
    } catch (error) {
      console.warn('Failed to load local database, falling back to demo data:', error)
    }

    entities.value = [...demoEntities]
    totalItems.value = demoEntities.length
    useDemoData.value = true
    lastFetched.value = Date.now()
    loading.value = false
    error.value = null
  }

  // Actions
  const fetchEntities = async (forceRefresh = false, newParams = {}) => {
    if (!forceRefresh && entities.value.length > 0 && lastFetched.value && !useDemoData.value) {
      const timeSinceLastFetch = Date.now() - lastFetched.value
      if (timeSinceLastFetch < 2 * 60 * 1000) {
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      const page = newParams.page || currentPage.value
      const pageSizeParam = newParams.page_size || pageSize.value
      params.append('page', page.toString())
      params.append('page_size', pageSizeParam.toString())

      if (newParams.sort_by || sortBy.value) {
        params.append('sort_by', (newParams.sort_by || sortBy.value).toString())
      }
      if (newParams.sort_dir || sortDir.value) {
        params.append('sort_dir', (newParams.sort_dir || sortDir.value).toString())
      }

      if (newParams.global || searchTerm.value) {
        params.append('global', (newParams.global || searchTerm.value).toString())
      }

      const filters = newParams.filters || columnFilters.value
      Object.entries(filters).forEach(([column, value]) => {
        if (value && value.trim() !== '') {
          params.append(`filters[${column}]`, value.trim())
        }
      })

      let apiUrl = `${API_BASE_URL}/entities`

      if (params.toString()) {
        apiUrl += `?${params.toString()}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const headers = {
        'Accept': 'application/json'
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const rawData = await response.json()

      if (!rawData || typeof rawData.total !== 'number' || !Array.isArray(rawData.results)) {
        throw new Error('Invalid API response: expected { total, page, page_size, results }')
      }

      const transformedEntities = rawData.results.map(entity => ({
        registration_id: entity['Registration ID'] || entity.registration_id || '',
        legal_name: entity['Legal Name'] || entity.legal_name || '',
        status: entity['Status'] || entity.status || '',
        address: entity['Address'] || entity.address || '',
        last_scan: entity['Last Scan'] || entity.last_scan || ''
      }))

      entities.value = transformedEntities
      totalItems.value = rawData.total
      currentPage.value = rawData.page || currentPage.value
      pageSize.value = rawData.page_size || pageSize.value
      useDemoData.value = false
      lastFetched.value = Date.now()

    } catch (err) {
      if (err.name === 'AbortError') {
        error.value = 'Request timed out. Please try again.'
      } else if (err.message.includes('Failed to fetch')) {
        error.value = 'Network error. Please check your connection and try again.'
      } else if (err.message.includes('CORS')) {
        error.value = 'CORS error. The API server may not allow requests from this origin.'
      } else {
        error.value = err.message
      }

      loadDemoData()
    } finally {
      loading.value = false
    }
  }

  // Refresh entities
  const refreshEntities = async () => {
    return await fetchEntities(true)
  }

  // Toggle between API and demo data
  const toggleDataSource = async () => {
    useDemoData.value = !useDemoData.value
    if (useDemoData.value) {
      loadDemoData()
    } else {
      await fetchEntities(true)
    }
  }

  // Set search term
  const setSearchTerm = async (term) => {
    searchTerm.value = term
    currentPage.value = 1
    if (useDemoData.value) {
      return
    }

    debounceSearch(async () => {
      await fetchEntities(true, { global: term, page: 1 })
    }, 300)
  }

  // Set column filter
  const setColumnFilter = async (column, value) => {
    columnFilters.value[column] = value
    currentPage.value = 1

    if (useDemoData.value) {
      return
    }

    debounceSearch(async () => {
      await fetchEntities(true, {
        filters: { ...columnFilters.value, [column]: value },
        page: 1
      })
    }, 300)
  }

  // Set sort
  const setSort = async (column, direction) => {
    if (sortBy.value === column && sortDir.value === direction) {
      sortBy.value = ''
      sortDir.value = 'asc'
      if (!useDemoData.value) {
        await fetchEntities(true, { sort_by: '', sort_dir: 'asc' })
      }
    } else {
      sortBy.value = column
      sortDir.value = direction
      if (!useDemoData.value) {
        await fetchEntities(true, { sort_by: column, sort_dir: direction })
      }
    }
  }

  // Set page
  const setPage = async (page) => {
    if (page === currentPage.value) return

    currentPage.value = page
    if (!useDemoData.value) {
      await fetchEntities(true, { page })
    }
  }

  // Set page size
  const setPageSize = async (size) => {
    if (size === pageSize.value) return

    pageSize.value = size
    currentPage.value = 1
    if (!useDemoData.value) {
      await fetchEntities(true, { page_size: size, page: 1 })
    }
  }

  // Clear filters
  const clearFilters = async () => {
    searchTerm.value = ''
    columnFilters.value = {}
    sortBy.value = ''
    sortDir.value = 'asc'
    currentPage.value = 1

    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = null
    }

    if (!useDemoData.value) {
      await fetchEntities(true, {
        global: '',
        filters: {},
        sort_by: '',
        sort_dir: 'asc',
        page: 1
      })
    }
  }

  // Clear data
  const clearData = () => {
    entities.value = []
    totalItems.value = 0
    lastFetched.value = null
    error.value = null
    useDemoData.value = false

    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = null
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Data source status status
  const dataSourceStatus = computed(() => {
    if (!isInitialized.value) {
      return null
    }

    return {
      isUsingDemoData: useDemoData.value,
      apiUrl: API_BASE_URL,
      lastFetchTime: lastFetched.value ? new Date(lastFetched.value).toLocaleString() : 'Never'
    }
  })

  return {
    entities,
    loading,
    error,
    searchTerm,
    columnFilters,
    sortBy,
    sortDir,
    currentPage,
    pageSize,
    totalItems,
    lastFetched,
    useDemoData,
    isInitialized,

    filteredEntities,
    paginatedEntities,
    totalPages: computed(() => Math.ceil(totalItems.value / pageSize.value)),
    getSearchStats,
    dataSourceStatus,

    fetchEntities,
    refreshEntities,
    toggleDataSource,
    setSearchTerm,
    setColumnFilter,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    clearData,
    clearError,
    loadDemoData,
    initStore
  }
})
