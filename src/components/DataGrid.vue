<template>
  <div class="h-[calc(100vh-65px)] sm:h-[calc(100vh-65px)]">

    <div
      class="flex flex-col bg-white h-[calc(90vh-50px)] sm:h-[calc(90vh-30px)] lg:h-[calc(90vh-30px)] border border-gray-300">

      <div
        class="px-3 sm:px-6 py-3 sm:py-2 border-b border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 flex-shrink-0 bg-gray-100">
        <div class="w-full sm:w-auto">
          <div class="relative">
            <input :value="entitiesStore.searchTerm" @input="(e) => entitiesStore.setSearchTerm(e.target.value)"
              type="text" placeholder="Search all columns..."
              class="w-full sm:w-80 pl-4 pr-10 py-2 sm:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" />
            <div v-if="entitiesStore.searchTerm" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="entitiesStore.setSearchTerm('')"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <select
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            v-model="selectedAccessOption">
            <option value="">-- Access Custom Table (4) --</option>
            <option value="more">More Entities</option>
            <option value="none">No entities selected upon creation</option>
            <option value="one">Only 1 entity</option>
            <option value="some">Some Entities</option>
          </select>

          <button @click="handleCreateCustomTable"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors w-full sm:w-auto">
            Create Custom Table
          </button>
        </div>
      </div>

      <div v-if="entitiesStore.getSearchStats.hasActiveFilters"
        class="px-3 sm:px-6 py-3 sm:py-2 bg-blue-50 border-b border-blue-200">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 w-full">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div class="flex items-center space-x-2">
              <svg class="h-4 w-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="text-sm text-blue-800">
                Found {{ entitiesStore.getSearchStats.totalResults }} result{{ entitiesStore.getSearchStats.totalResults
                  !== 1 ? 's' : '' }}
              </span>
            </div>

            <div v-if="entitiesStore.getSearchStats.activeColumnFilters.length > 0"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span class="text-xs text-blue-600 font-medium">Filters:</span>
              <div class="flex flex-wrap gap-1 w-full sm:w-auto">
                <span v-for="filter in entitiesStore.getSearchStats.activeColumnFilters" :key="filter.column"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ filter.column }}: {{ filter.value }}
                  <button @click="entitiesStore.setColumnFilter(filter.column, '')"
                    class="ml-1 text-blue-600 hover:text-blue-800 p-0.5">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <button @click="entitiesStore.clearFilters"
            class="text-xs text-blue-600 hover:text-blue-800 underline self-start sm:self-center">
            Clear all filters
          </button>
        </div>
      </div>

      <div v-if="entitiesStore.error" class="px-3 sm:px-6 py-3 bg-red-50 border-b border-red-200">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span class="text-sm text-red-800">{{ entitiesStore.error }}</span>
          </div>
          <button @click="entitiesStore.clearError"
            class="text-xs text-red-600 hover:text-red-800 underline self-start sm:self-center">
            Dismiss
          </button>
        </div>
      </div>

      <div class="flex flex-col flex-1 min-h-0">
        <div v-if="entitiesStore.loading" class="flex items-center justify-center h-full px-4">
          <div
            class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p class="text-gray-600 text-sm sm:text-base">Loading...</p>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div v-if="entitiesStore.totalItems > 0" class="flex-1 flex flex-col min-h-0">
            <div class="sticky top-0 z-20 bg-white border-b border-gray-200 flex-shrink-0">
              <div class="overflow-x-auto">
                <div class="flex" :style="{ minWidth: getTotalTableWidth() + 'px' }">
                  <div
                    class="sticky left-0 z-30 bg-white border-r border-gray-200 min-w-[80px] p-2 sm:p-3 flex justify-center items-center">
                    <input :checked="isAllSelected" :indeterminate="isPartiallySelected" @change="toggleSelectAll"
                      type="checkbox" class="rounded w-4 h-4 sm:w-3 sm:h-3" />
                  </div>

                  <div v-for="column in columns" :key="column.key" class="bg-white border-r border-gray-200"
                    :style="{ width: column.width + 'px', minWidth: column.width + 'px' }">
                    <div class="p-2 sm:p-3 bg-gray-50">
                      <div class="mb-2">
                        <div class="font-medium text-gray-800 text-sm sm:text-base">
                          {{ column.label }}
                        </div>
                      </div>
                      <div class="relative">
                        <input :value="entitiesStore.columnFilters[column.key] || ''"
                          @input="(e) => entitiesStore.setColumnFilter(column.key, e.target.value)" type="text"
                          :placeholder="`Search ${column.label.toLowerCase()}...`"
                          class="w-full pl-2 pr-8 sm:pr-2 py-1.5 sm:py-1 text-xs sm:text-sm border rounded border-gray-300 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                        <div v-if="entitiesStore.columnFilters[column.key]"
                          class="absolute inset-y-0 right-0 pr-2 flex items-center">
                          <button @click="entitiesStore.setColumnFilter(column.key, '')"
                            class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1">
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto min-h-0">
              <div class="overflow-x-auto" style="min-width: 100%;">
                <div v-for="row in entitiesStore.paginatedEntities" :key="row.registration_id"
                  class="flex border-b border-gray-200 transition-all duration-300 hover:bg-gray-50" :style="{
                    minWidth: getTotalTableWidth() + 'px',
                    width: getTotalTableWidth() + 'px'
                  }">
                  <div
                    class="sticky left-0 z-30 bg-white border-r border-gray-200 min-w-[80px] p-2 sm:p-3 flex items-center justify-center">
                    <input :checked="isRowSelected(row)" @change="toggleRowSelection(row)" type="checkbox"
                      class="rounded w-4 h-4 sm:w-3 sm:h-3" />
                  </div>

                  <div v-for="column in columns" :key="column.key" class="bg-white border-r border-gray-200"
                    :style="{ width: column.width + 'px', minWidth: column.width + 'px' }">
                    <div class="p-2 sm:p-3">
                      <div class="text-xs sm:text-sm relative group"
                        :title="getFullCellValue(row, column.key) !== getCellValue(row, column.key) ? getFullCellValue(row, column.key) : ''"
                        v-html="highlightText(getCellValue(row, column.key), column.key)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="entitiesStore.entities.length === 0" class="flex-1 flex items-center justify-center px-4">
            <div class="text-center">
              <svg class="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 class="mt-2 text-sm sm:text-base font-medium text-gray-900">No data available</h3>
              <p class="mt-1 text-xs sm:text-sm text-gray-500 px-2">Please try refreshing the page or check your
                connection.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="entitiesStore.entities.length > 0"
        class="bg-gray-100 flex-shrink-0 w-full h-[65px] sm:h-[60px] lg:w-[calc(100%-255px)]"
        style="position: fixed; bottom: 0; z-index: 50;">
        <PaginationBar :current-page="entitiesStore.currentPage" :page-size="entitiesStore.pageSize"
          :total-items="entitiesStore.totalItems" @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange" />
      </div>
    </div>

    <TableBuilderModal v-if="showTableBuilderModal" :selected-rows="selectedRows" @close="handleModalClose"
      @table-created="handleTableCreated" />

  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEntitiesStore } from '../stores/entities'
import PaginationBar from './PaginationBar.vue'
import TableBuilderModal from './TableBuilderModal.vue'

export default {
  name: 'DataGrid',
  components: { PaginationBar, TableBuilderModal },
  emits: ['create-custom-table'],
  setup(props, { emit }) {
    const entitiesStore = useEntitiesStore()
    const selectedRows = ref([])
    const selectedAccessOption = ref('')
    const showTableBuilderModal = ref(false)

    const entityColumns = [
      { key: 'registration_id', label: 'Registration ID', width: 300 },
      { key: 'legal_name', label: 'Legal Name', width: 300 },
      { key: 'status', label: 'Status', width: 300 },
      { key: 'address', label: 'Address', width: 300 },
      { key: 'last_scan', label: 'Last Scan', width: 300 }
    ]

    const columns = computed(() => entityColumns)

    // Is all selected
    const isAllSelected = computed(() => {
      const currentEntities = entitiesStore.getSearchStats.hasActiveFilters
        ? entitiesStore.filteredEntities
        : entitiesStore.paginatedEntities
      return currentEntities.length > 0 && selectedRows.value.length === currentEntities.length
    })

    // Is partially selected
    const isPartiallySelected = computed(() => {
      const currentEntities = entitiesStore.getSearchStats.hasActiveFilters
        ? entitiesStore.filteredEntities
        : entitiesStore.paginatedEntities
      return selectedRows.value.length > 0 && selectedRows.value.length < currentEntities.length
    })

    // Fetch data
    const fetchData = async () => {
      await entitiesStore.fetchEntities()
      selectedRows.value = []
    }

    // Cycle sort
    const cycleSort = (columnKey) => {
      if (entitiesStore.sortBy === columnKey) {
        if (entitiesStore.sortDir === 'asc') {
          entitiesStore.setSort(columnKey, 'desc')
        } else {
          entitiesStore.setSort(columnKey, '')
        }
      } else {
        entitiesStore.setSort(columnKey, 'asc')
      }
    }

    // Handle page change
    const handlePageChange = (page) => {
      entitiesStore.setPage(page)
    }

    // Handle page size change
    const handlePageSizeChange = (size) => {
      entitiesStore.setPageSize(size)
    }

    // Toggle select all
    const toggleSelectAll = () => {
      const currentEntities = entitiesStore.getSearchStats.hasActiveFilters
        ? entitiesStore.filteredEntities
        : entitiesStore.paginatedEntities
      selectedRows.value = isAllSelected.value ? [] : [...currentEntities]
    }

    // Toggle row selection
    const toggleRowSelection = (row) => {
      const index = selectedRows.value.findIndex(r => r.registration_id === row.registration_id)
      if (index > -1) selectedRows.value.splice(index, 1)
      else selectedRows.value.push(row)
    }

    // Is row selected
    const isRowSelected = (row) => {
      return selectedRows.value.some(r => r.registration_id === row.registration_id)
    }

    // Get total table width
    const getTotalTableWidth = () => {
      let totalWidth = 80 // Selection column width

      // Add all column widths (now all equal)
      columns.value.forEach(column => {
        totalWidth += column.width
      })

      return totalWidth
    }

    // Get cell value
    const getCellValue = (row, columnKey) => {
      const value = row[columnKey]
      if (value === null || value === undefined || value === '') {
        return '-'
      }

      // Handle dates
      if (columnKey === 'last_scan') {
        if (value && value !== '-') {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString()
            }
          } catch (e) {
            // If date parsing fails, return original value
          }
        }
      }

      // Limit character length to 28 and add three periods if longer
      const stringValue = value.toString()
      if (stringValue.length > 28) {
        return stringValue.substring(0, 28) + '...'
      }

      return stringValue
    }

    // Get full cell value
    const getFullCellValue = (row, columnKey) => {
      const value = row[columnKey]
      if (value === null || value === undefined || value === '') {
        return '-'
      }

      // Handle dates
      if (columnKey === 'last_scan') {
        if (value && value !== '-') {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString()
            }
          } catch (e) {
            // If date parsing fails, return original value
          }
        }
      }

      return value
    }

    // Truncate text
    const truncateText = (text, maxLength = 50) => {
      if (!text || text === '-') return '-'
      const stringValue = text.toString()
      if (stringValue.length <= maxLength) {
        return stringValue
      }
      return stringValue.substring(0, maxLength) + '...'
    }

    // Highlight text
    const highlightText = (text, columnKey) => {
      if (!text || text === '-') return '-'

      let maxLength = 50
      if (columnKey === 'address') {
        maxLength = 80
      } else if (columnKey === 'legal_name') {
        maxLength = 60
      }

      const truncatedText = truncateText(text, maxLength)

      let highlighted = truncatedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      if (entitiesStore.searchTerm) {
        const regex = new RegExp(`(${entitiesStore.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
      }

      if (entitiesStore.columnFilters[columnKey]) {
        const regex = new RegExp(`(${entitiesStore.columnFilters[columnKey].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        highlighted = highlighted.replace(regex, '<mark class="bg-blue-200 px-1 rounded">$1</mark>')
      }

      return highlighted
    }

    // Update column widths based on available space
    const updateColumnWidths = () => {
      const availableWidth = window.innerWidth - 100

      const totalInitialWidth = columns.value.reduce((sum, column) => sum + column.width, 0)

      if (availableWidth < totalInitialWidth) {
        const scaleFactor = availableWidth / totalInitialWidth
        columns.value.forEach(column => {
          column.width = Math.max(120, Math.floor(column.width * scaleFactor))
        })
      } else {
        columns.value.forEach(column => {
          if (column.key === 'registration_id') column.width = 300
          else if (column.key === 'legal_name') column.width = 300
          else if (column.key === 'status') column.width = 300
          else if (column.key === 'address') column.width = 300
          else if (column.key === 'last_scan') column.width = 300
        })
      }
    }

    // Watch for changes in search term
    watch(() => entitiesStore.searchTerm, () => {
      entitiesStore.setPage(1)
    })

    // Watch for changes in column filters
    watch(() => entitiesStore.columnFilters, () => {
      entitiesStore.setPage(1)
    }, { deep: true })

    // On mounted
    onMounted(() => {
      entitiesStore.initStore()
      fetchData()
      window.addEventListener('resize', updateColumnWidths)
    })

    // On unmounted
    onUnmounted(() => {
      window.removeEventListener('resize', updateColumnWidths)
    })

    // Handle create custom table event
    const handleCreateCustomTable = () => {
      showTableBuilderModal.value = true
    }

    // Handle modal close
    const handleModalClose = () => {
      showTableBuilderModal.value = false
    }

    // Handle table creation
    const handleTableCreated = (tableData) => {
      emit('create-custom-table', tableData)
      showTableBuilderModal.value = false
    }

    return {
      entitiesStore,
      selectedRows,
      selectedAccessOption,
      columns,
      isAllSelected,
      isPartiallySelected,
      showTableBuilderModal,
      fetchData,
      cycleSort,
      handlePageChange,
      handlePageSizeChange,
      toggleSelectAll,
      toggleRowSelection,
      isRowSelected,
      getTotalTableWidth,
      getCellValue,
      getFullCellValue,
      truncateText,
      highlightText,
      updateColumnWidths,
      handleCreateCustomTable,
      handleModalClose,
      handleTableCreated
    }
  }
}
</script>

<style scoped>
.sticky {
  position: sticky;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-yellow-50 {
  background-color: #fffbeb;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.z-20 {
  z-index: 20;
}

.z-25 {
  z-index: 25;
}

.z-30 {
  z-index: 30;
}

.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

.border-r {
  border-right-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.min-w-\[50px\] {
  min-width: 50px;
}

.min-w-\[150px\] {
  min-width: 150px;
}

.flex {
  display: flex;
}

.overflow-auto {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-auto {
  overflow-x: auto;
  overflow-y: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
  overflow-x: hidden;
}

.flex>div {
  flex-shrink: 0;
}

.flex.border-b {
  cursor: default;
}

.flex.border-b input[type="checkbox"] {
  min-width: 16px;
  min-height: 16px;
  margin: 0;
  padding: 0;
}

.sticky.left-0.z-30 {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.min-h-0 {
  min-height: 0;
}

.flex-1 {
  flex: 1 1 0%;
}

button {
  transition: all 0.15s ease-in-out;
}

input {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:text-blue-600:hover {
  color: #2563eb;
}

.hover\:text-gray-600:hover {
  color: #4b5563;
}

.hover\:text-yellow-600:hover {
  color: #d97706;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:text-yellow-900:hover {
  color: #92400e;
}

.hover\:text-gray-900:hover {
  color: #111827;
}

mark.bg-yellow-200 {
  background-color: #fef3c7;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

mark.bg-blue-200 {
  background-color: #bfdbfe;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-blue-500:focus {
  --tw-ring-color: #3b82f6;
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@media (max-width: 640px) {

  button,
  input[type="checkbox"],
  select {
    min-height: 44px;
  }

  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }

  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  input,
  select {
    font-size: 16px;
  }
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

input[type="checkbox"] {
  pointer-events: auto !important;
  cursor: pointer;
  z-index: 40;
}

.sticky.left-0 {
  pointer-events: auto !important;
  z-index: 40;
  background-color: white;
  position: sticky;
  left: 0;
}

.sticky.left-0.z-30 {
  z-index: 40 !important;
}

.flex.border-b {
  pointer-events: auto !important;
}

input[type="checkbox"]:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

input[type="checkbox"]:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

input[type="checkbox"]:indeterminate::after {
  content: '−';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
