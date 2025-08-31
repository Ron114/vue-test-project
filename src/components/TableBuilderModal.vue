<template>
  <div class="fixed inset-0 bg-[#00000069] bg-opacity-75 flex items-center justify-center z-[9999] p-4"
    @click.self="handleClose">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative z-[10000]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Table Builder</h3>
          <button @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <label class="block text-lg font-medium text-gray-900 mb-3">
                Insert Table Name
              </label>
              <input v-model="form.tableName" type="text" required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none"
                placeholder="Enter table name" />
            </div>

            <div>
              <label class="block text-lg font-medium text-gray-900 mb-3">
                Select Datapoints
              </label>
              <div class="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-4 pb-2 border-b border-gray-200">
                    <div class="font-medium text-gray-700">Column</div>
                    <div class="font-medium text-gray-700 text-center">Include</div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 items-center py-2 bg-blue-50 rounded px-2">
                    <div class="text-sm text-gray-600 font-medium">Column ID (selected by default)</div>
                    <div class="flex justify-center">
                      <input type="checkbox" checked disabled
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-200 cursor-not-allowed" />
                    </div>
                  </div>

                  <div v-for="column in entityColumns" :key="column.key"
                    class="grid grid-cols-2 gap-4 items-center py-2 hover:bg-gray-100 rounded px-2 transition-colors duration-150">
                    <div class="text-sm text-gray-600">{{ column.label }}</div>
                    <div class="flex justify-center">
                      <input :checked="form.datapoints.includes(column.key)" @change="toggleDatapoint(column.key)"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 hover:ring-blue-300 transition-all duration-150 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-lg font-medium text-gray-900 mb-3">
                New Table
              </label>
              <div class="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-4 pb-2 border-b border-gray-200">
                    <div class="font-medium text-gray-700">Column Name</div>
                    <div class="font-medium text-gray-700">Select Column Type</div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 items-center py-2 bg-blue-50 rounded px-2">
                    <div class="text-sm text-gray-600 font-medium">Column ID</div>
                    <div class="text-sm text-blue-600 italic font-medium">Linked by default</div>
                  </div>

                  <div v-for="column in selectedColumns" :key="column.key"
                    class="grid grid-cols-2 gap-4 items-center py-2 hover:bg-gray-100 rounded px-2 transition-colors duration-150">
                    <div class="text-sm text-gray-600">{{ column.label }}</div>
                    <div class="text-sm text-gray-600">
                      <select v-model="form.columnTypes[column.key]"
                        class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150">
                        <option value="TEXT">TEXT</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="DATE">DATE</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-2 gap-4 items-center py-2 hover:bg-gray-100 rounded px-2 transition-colors duration-150">
                    <div class="text-sm text-gray-400">
                      <input v-model="form.customColumnName" type="text" placeholder="add name"
                        class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150" />
                    </div>
                    <div class="text-sm text-gray-400">
                      <select v-model="form.customColumnType"
                        class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150">
                        <option value="">Select type</option>
                        <option value="TEXT">TEXT</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="DATE">DATE</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="button" @click="addCustomColumn"
                  class="text-blue-600 hover:text-blue-800 text-sm underline mt-3 hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-150">
                  + add more
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <label class="block text-lg font-medium text-gray-900 mb-3">
            Share with
          </label>
          <input v-model="form.shareWith" type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none"
            placeholder="Use @ to tag user names OR user groups to share this table with" />
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
          <button type="button" @click="handleClose"
            class="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting || !form.tableName"
            class="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md">
            {{ isSubmitting ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TableBuilderModal',
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'table-created'],
  setup(props, { emit }) {
    const isSubmitting = ref(false)

    // Prevent body scroll
    const preventBodyScroll = () => {
      document.body.style.overflow = 'hidden'
    }

    // Restore body scroll
    const restoreBodyScroll = () => {
      document.body.style.overflow = ''
    }

    // On mounted
    onMounted(() => {
      preventBodyScroll()
    })

    // On unmounted
    onUnmounted(() => {
      restoreBodyScroll()
    })

    // Entity columns
    const entityColumns = [
      { key: 'registration_id', label: 'Name of Column 1' },
      { key: 'legal_name', label: 'Name of Column 2' },
      { key: 'status', label: 'Name of Column 3' },
      { key: 'address', label: 'Name of Column 4' },
      { key: 'last_scan', label: 'Name of Column 5' },
      { key: 'created_date', label: 'Name of Column 6' },
      { key: 'updated_date', label: 'Name of Column 7' },
      { key: 'contact_email', label: 'Name of Column 8' },
      { key: 'phone_number', label: 'Name of Column 9' },
      { key: 'business_type', label: 'Name of Column 10' },
      { key: 'tax_id', label: 'Name of Column 11' },
      { key: 'license_number', label: 'Name of Column 12' },
      { key: 'expiry_date', label: 'Name of Column 13' },
      { key: 'compliance_status', label: 'Name of Column 14' },
      { key: 'notes', label: 'Name of Column 15' }
    ]

    // Form
    const form = reactive({
      tableName: '',
      datapoints: ['registration_id', 'legal_name', 'status', 'address', 'last_scan'],
      shareWith: '',
      customColumnName: '',
      customColumnType: '',
      columnTypes: {
        'registration_id': 'TEXT',
        'legal_name': 'TEXT',
        'status': 'TEXT',
        'address': 'TEXT',
        'last_scan': 'DATE'
      }
    })

    // Toggle datapoint
    const toggleDatapoint = (columnKey) => {
      const index = form.datapoints.indexOf(columnKey)
      if (index > -1) {
        form.datapoints.splice(index, 1)
        delete form.columnTypes[columnKey]
      } else {
        form.datapoints.push(columnKey)
        form.columnTypes[columnKey] = 'TEXT' // Default type
      }
    }

    // Add custom column
    const addCustomColumn = () => {
      if (form.customColumnName && form.customColumnType) {
        const customKey = `custom_${form.customColumnName.toLowerCase().replace(/\s+/g, '_')}`
        form.datapoints.push(customKey)
        form.columnTypes[customKey] = form.customColumnType
        form.customColumnName = ''
        form.customColumnType = ''
      }
    }

    // Selected columns
    const selectedColumns = computed(() => {
      return entityColumns.filter(col => form.datapoints.includes(col.key))
    })

    // Handle submit
    const handleSubmit = async () => {
      if (!form.tableName) return

      isSubmitting.value = true

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockTableData = {
          config_id: 'demo-' + Date.now(),
          table_name: form.tableName,
          datapoints: form.datapoints,
          column_types: form.columnTypes,
          share_with: form.shareWith,
          custom_columns: form.customColumnName ? [form.customColumnName] : [],
          registration_ids: props.selectedRows.map(row => row.registration_id)
        }

        emit('table-created', mockTableData)
      } catch (error) {
        alert('Failed to create table. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    // Handle close
    const handleClose = () => {
      restoreBodyScroll()
      emit('close')
    }

    return {
      form,
      isSubmitting,
      entityColumns,
      selectedColumns,
      toggleDatapoint,
      addCustomColumn,
      handleSubmit,
      handleClose
    }
  }
}
</script>

<style scoped>
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-\[9999\] {
  z-index: 9999;
}

.fixed.inset-0 {
  pointer-events: auto;
}

.z-\[10000\] {
  z-index: 10000;
  pointer-events: auto;
}

.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

.transition-all {
  transition: all 0.15s ease-in-out;
}

input[type="text"],
input[type="checkbox"],
select {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.space-y-6>*+* {
  margin-top: 1.5rem;
}

.space-y-3>*+* {
  margin-top: 0.75rem;
}

.space-y-2>*+* {
  margin-top: 0.5rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

.max-h-80::-webkit-scrollbar {
  width: 6px;
}

.max-h-80::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.max-h-80::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-80::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:ring-blue-300:hover {
  --tw-ring-color: #93c5fd;
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-1:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-blue-500:focus {
  --tw-ring-color: #3b82f6;
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}
</style>

<style>
.bg-gray-900 {
  background-color: #111827;
}

.bg-opacity-75 {
  --tw-bg-opacity: 0.75;
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
