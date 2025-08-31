<template>
  <header
    class="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center h-[60px] justify-between shadow-md-lg">
    <div class="flex items-center space-x-4 relative">
      <!-- Logo -->
      <img src="../assets/Logo.png" alt="granit.ai" class="w-42">

      <!-- Hamburger Menu Icon -->
      <button @click="$emit('toggle-sidebar')"
        class="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors sm:block hidden"
        :class="{ 'bg-blue-100 text-blue-600': sidebarOpen }"
        :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'" :aria-expanded="sidebarOpen">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Right side actions -->
    <div class="flex items-center space-x-4">
      <!-- Entities Text -->
      <span class="text-gray-500 font-medium sm:block hidden">Entities</span>

      <button @click="$emit('toggle-sidebar')"
        class="p-2 rounded-md text-gray-600 hover:text-gray-800 sm:hidden block hover:bg-gray-100 transition-colors"
        :class="{ 'bg-blue-100 text-blue-600': sidebarOpen }"
        :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'" :aria-expanded="sidebarOpen">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script>
import { useEntitiesStore } from '../stores/entities'

export default {
  name: 'TopBar',
  props: {
    sidebarOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-sidebar'],
  setup() {
    const entitiesStore = useEntitiesStore()

    // Initialize store if not already done
    if (entitiesStore && !entitiesStore.isInitialized) {
      try {
        entitiesStore.initStore()
      } catch (error) {
        console.error('Could not initialize store:', error)
      }
    }

    return {
      entitiesStore
    }
  }
}
</script>

<style scoped>
button {
  transition: all 0.15s ease-in-out;
}

.space-x-4>*+* {
  margin-left: 1rem;
}

.z-50 {
  z-index: 50;
}

@media (max-width: 1023px) {
  .lg\:hidden {
    display: block;
  }

  .lg\:px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .lg\text-2xl {
    font-size: 1.25rem;
  }
}

button[aria-expanded="true"] {
  background-color: #dbeafe !important;
  color: #2563eb !important;
  border: 1px solid #93c5fd;
}

button[aria-expanded="true"]:hover {
  background-color: #bfdbfe !important;
  color: #1d4ed8 !important;
}

button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 6px;
}

button:focus:not(:focus-visible) {
  outline: none;
}

@media (min-width: 1024px) {
  .lg\:hidden {
    display: none;
  }

  .lg\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .lg\text-2xl {
    font-size: 1.5rem;
  }
}
</style>
