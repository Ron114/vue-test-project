<template>
  <div
    class="bg-gray-100 border-t border-gray-200 px-3 sm:px-4 py-3 lg:py-0 lg:h-full flex flex-row lg:items-center justify-center md:justify-between gap-3 lg:gap-0 min-w-fit h-full">
    <div class="hidden sm:flex items-center justify-center lg:justify-start space-x-2">
      <div class="flex items-center space-x-1">
        <span class="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">Page:</span>
        <select :value="currentPage" @change="handlePageChange"
          class="rounded px-2 lg:px-3 py-1 text-xs sm:text-sm lg:text-base outline-none bg-[#e9e9ed] min-w-[50px] sm:min-w-[60px]">
          <option v-for="page in totalPages" :key="page" :value="page">
            {{ page }}
          </option>
        </select>
      </div>
    </div>

    <div
      class="flex flex-col items-center justify-center space-y-2 lg:space-y-0 lg:flex-row lg:flex-1 lg:justify-center">
      <div class="flex items-center justify-center space-x-1">
        <button @click="goToPage(1)" :disabled="currentPage === 1"
          class="px-1 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-8 sm:w-10 lg:w-12 h-8 cursor-pointer"
          title="First page">
          <span class="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold">«</span>
        </button>

        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
          class="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-8 sm:w-10 lg:w-12 h-8 cursor-pointer"
          title="Previous page">
          <span class="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold">&lt;</span>
        </button>

        <div class="flex items-center space-x-1">
          <template v-for="(page, index) in visiblePages" :key="index">
            <button v-if="page !== '...'" @click="goToPage(page)" :class="[
              'w-8 sm:w-10 lg:w-12 h-8 cursor-pointer rounded text-xs sm:text-sm lg:text-base font-medium transition-colors flex items-center justify-center',
              page === currentPage
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            ]">
              {{ page }}
            </button>
            <span v-else class="w-6 h-6 flex items-center justify-center text-gray-500 text-xs sm:text-sm lg:text-base">
              {{ page }}
            </span>
          </template>
        </div>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
          class="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-8 sm:w-10 lg:w-12 h-8 cursor-pointer"
          title="Next page">
          <span class="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold">&gt;</span>
        </button>

        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
          class="px-1 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-8 sm:w-10 lg:w-12 h-8 cursor-pointer"
          title="Last page">
          <span class="text-gray-600 text-xs sm:text-sm lg:text-base font-semibold">»</span>
        </button>
      </div>
    </div>

    <div class="hidden sm:flex flex-col sm:flex-row items-center gap-2 lg:gap-2">
      <div class="flex items-center justify-center lg:justify-start">
        <span class="text-xs sm:text-sm lg:text-base text-gray-600 text-center lg:text-left">
          {{ startItem }} to {{ endItem }} of <strong>{{ totalItems }}</strong>
        </span>
      </div>

      <div class="flex items-center justify-center lg:justify-start space-x-1">
        <span class="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">Page Size:</span>
        <select :value="pageSize" @change="handlePageSizeChange"
          class="rounded px-2 py-1 text-xs sm:text-sm lg:text-base bg-[#e9e9ed] min-w-[50px] sm:min-w-[60px]">
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PaginationBar',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  },
  emits: ['page-change', 'page-size-change'],
  setup(props, { emit }) {
    const pageSizes = [25, 100, 500, 1000]

    // Start item
    const startItem = computed(() => {
      return props.totalItems > 0 ? (props.currentPage - 1) * props.pageSize + 1 : 0
    })

    // End item
    const endItem = computed(() => {
      return Math.min(props.currentPage * props.pageSize, props.totalItems)
    })

    // Total pages
    const totalPages = computed(() => {
      if (!props.totalItems || props.totalItems <= 0 || !props.pageSize || props.pageSize <= 0) {
        return 1
      }
      return Math.ceil(props.totalItems / props.pageSize)
    })

    // Visible pages
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 7

      if (!totalPages.value || totalPages.value <= 0) {
        return [1]
      }

      if (totalPages.value <= maxVisible) {
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)

        const start = Math.max(2, props.currentPage - 1)
        const end = Math.min(totalPages.value - 1, props.currentPage + 1)

        if (start > 2) {
          pages.push('...')
        }

        for (let i = start; i <= end; i++) {
          if (i > 1 && i < totalPages.value) {
            pages.push(i)
          }
        }

        if (end < totalPages.value - 1) {
          pages.push('...')
        }

        if (totalPages.value > 1) {
          pages.push(totalPages.value)
        }
      }

      return pages
    })

    // Go to page
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
        emit('page-change', page)
      }
    }

    // Handle page change
    const handlePageChange = (event) => {
      const page = parseInt(event.target.value)
      if (page && page !== props.currentPage) {
        emit('page-change', page)
      }
    }

    // Handle page size change
    const handlePageSizeChange = (event) => {
      const size = parseInt(event.target.value)
      if (size && size !== props.pageSize) {
        emit('page-size-change', size)
      }
    }

    return {
      pageSizes,
      startItem,
      endItem,
      totalPages,
      visiblePages,
      goToPage,
      handlePageChange,
      handlePageSizeChange
    }
  }
}
</script>

<style scoped>
button {
  transition: all 0.15s ease-in-out;
}

select {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.space-x-4>*+* {
  margin-left: 1rem;
}

.space-x-2>*+* {
  margin-left: 0.5rem;
}

.space-x-1>*+* {
  margin-left: 0.25rem;
}

@media (max-width: 1023px) {

  button {
    min-height: 32px;
    min-width: 32px;
  }

  .overflow-auto,
  .overflow-y-auto,
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }

  .gap-3 {
    gap: 0.75rem;
  }

  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

@media (max-width: 639px) {

  .gap-3 {
    gap: 0.5rem;
  }

  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .space-x-1>*+* {
    margin-left: 0.125rem;
  }

  .space-x-2>*+* {
    margin-left: 0.25rem;
  }
}

@media (max-width: 1023px) {
  .lg\:flex-row {
    flex-direction: column !important;
  }

  .lg\:items-center {
    align-items: center !important;
  }

  .lg\:justify-between {
    justify-content: center !important;
  }

  .lg\:justify-start {
    justify-content: center !important;
  }

  .lg\:gap-0 {
    gap: 0.75rem !important;
  }
}
</style>
