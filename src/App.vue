<template>
  <div :class="[
    'w-full min-h-screen bg-gray-50 flex flex-col',
    isMobile && sidebarOpen ? 'sidebar-open' : ''
  ]" style="background-color: #f9fafb !important;">
    <!-- TopBar -->
    <TopBar :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />

    <!-- Mobile Backdrop Overlay -->
    <!-- <div v-if="isMobile && sidebarOpen" 
         @click="closeSidebar"
         class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
         aria-hidden="true">
    </div> -->

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Left Sidebar -->
      <div :class="[
        'bg-white border-r border-gray-200 flex flex-col sidebar h-[calc(100vh-60px)] py-2 w-[256px]',
        'fixed lg:relative',
        'transition-all duration-300 ease-in-out',
        sidebarClasses
      ]" :aria-hidden="isMobile && !sidebarOpen" role="navigation" aria-label="Main navigation"
        style="pointer-events: auto;">
        <!-- Sidebar Header with Close Button -->
        <div class="flex items-center justify-between px-3 border-b border-gray-200">
          <button v-if="isMobile" @click="closeSidebar"
            class="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="flex-1" style="pointer-events: auto;">
          <div v-for="menuItem in menuItems" :key="menuItem.id" @click="setActiveMenuItem(menuItem.id)"
            @keydown.enter="setActiveMenuItem(menuItem.id)" @keydown.space="setActiveMenuItem(menuItem.id)" :class="[
              'px-3 py-3 mb-2 cursor-pointer transition-all duration-200',
              activeMenuItem === menuItem.id
                ? 'active-menu-item text-gray-800 font-bold'
                : 'text-gray-800 hover:bg-gray-100'
            ]" :tabindex="0" role="menuitem" :aria-current="activeMenuItem === menuItem.id ? 'page' : undefined"
            style="pointer-events: auto;">
            {{ menuItem.label }}
          </div>
        </nav>
      </div>

      <!-- Main Content Area -->
      <div :class="[
        'flex-1 flex flex-col min-w-0 main-content',
        'transition-all duration-300 ease-in-out',
        'bg-gray-50'
      ]"
        :style="isMobile && sidebarOpen ? 'margin-left: 0; background-color: #f9fafb !important;' : 'background-color: #f9fafb !important;'">
        <div class="flex-1 p-1 bg-gray-100">
          <DataGrid :view="'entities'" @create-custom-table="openTableBuilderModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import TopBar from './components/TopBar.vue'
import DataGrid from './components/DataGrid.vue'
import { useEntitiesStore } from './stores/entities.js'

export default {
  name: 'App',
  components: {
    TopBar,
    DataGrid,
  },
  setup() {
    const selectedRows = ref([])
    const sidebarOpen = ref(false)
    const isMobile = ref(false)
    const activeMenuItem = ref('entities') // Track active menu item

    // Menu items configuration
    const menuItems = ref([
      { id: 'entities', label: 'Entities' },
      { id: 'api-control', label: 'API Control' },
      { id: 'menu-3', label: 'Menu 3' },
      { id: 'menu-4', label: 'Menu 4' },
      { id: 'menu-5', label: 'Menu 5' }
    ])

    // Initialize stores
    const entitiesStore = useEntitiesStore()

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value

      // Prevent body scroll when sidebar is open on mobile
      if (isMobile.value) {
        document.body.style.overflow = sidebarOpen.value ? 'hidden' : 'auto'
      }
    }

    const closeSidebar = () => {
      sidebarOpen.value = false

      // Restore body scroll
      if (isMobile.value) {
        document.body.style.overflow = 'auto'
      }
    }

    const handleKeydown = (event) => {
      if (event.key === 'Escape' && sidebarOpen.value) {
        closeSidebar()
      }

      // Close sidebar when pressing Escape or clicking outside
      if (event.key === 'Escape' && sidebarOpen.value) {
        closeSidebar()
      }
    }

    const setActiveMenuItem = (menuItem) => {
      activeMenuItem.value = menuItem
      // Close sidebar on mobile after selecting a menu item
      if (isMobile.value) {
        closeSidebar()
      }
    }

    const openTableBuilderModal = (rows) => {
      selectedRows.value = rows
    }

    // Computed property for sidebar classes
    const sidebarClasses = computed(() => {
      const classes = isMobile.value
        ? (sidebarOpen.value
          ? 'translate-x-0 shadow-2xl border border-red-500 w-64'
          : '-translate-x-full w-0')
        : 'translate-x-0 w-64'
      return classes
    })

    // Enhanced mobile detection with debouncing
    let resizeTimeout
    const checkMobile = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const wasMobile = isMobile.value
        const newIsMobile = window.innerWidth < 1024 // lg breakpoint

        isMobile.value = newIsMobile

        // If switching from desktop to mobile, ensure sidebar is closed
        if (!wasMobile && isMobile.value) {
          sidebarOpen.value = false
          document.body.style.overflow = 'auto'
        }

        // If switching from mobile to desktop, ensure sidebar is visible
        if (wasMobile && !isMobile.value) {
          sidebarOpen.value = true
          document.body.style.overflow = 'auto'
        }
      }, 100)
    }

    onMounted(async () => {
      // Fetch entities from the API
      await entitiesStore.fetchEntities()

      // Check initial screen size
      checkMobile()

      // Add resize listener
      window.addEventListener('resize', checkMobile)

      // Add keyboard listener for closing sidebar
      window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeydown)
    })

    return {
      selectedRows,
      entitiesStore,
      openTableBuilderModal,
      sidebarOpen,
      isMobile,
      activeMenuItem,
      menuItems,
      toggleSidebar,
      closeSidebar,
      setActiveMenuItem,
      handleKeydown,
      sidebarClasses
    }
  }
}
</script>

<style>
/* Ensure proper layout and scrolling */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background-color: #f9fafb;
}

#app {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #f9fafb;
}

/* Ensure proper sticky positioning */
.sticky {
  position: sticky;
}

/* Add smooth transitions */
.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

/* Enhanced sidebar animations */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.sidebar-enter-to,
.sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Smooth width transitions for sidebar */
.sidebar {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

/* Specific width transitions */
.sidebar.w-0 {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
}

.sidebar.w-64 {
  width: 16rem !important;
  min-width: 16rem !important;
  max-width: 16rem !important;
}

/* Smooth slide-in animation for sidebar */
@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideInFromLeft {
  animation: slideInFromLeft 0.6s ease-out;
}

/* Enhanced sidebar item animations */
.sidebar-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.sidebar-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
  transition: width 0.3s ease;
}

.sidebar-item:hover::before {
  width: 100%;
}

.sidebar-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* Ensure proper z-index layering */
.z-10 {
  z-index: 10;
}

/* Ensure the main content area can scroll properly */
.flex-1 {
  overflow: auto;
}

/* Ensure main content area has proper background and visibility */
.main-content {
  background-color: #f9fafb;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  width: 100%;
}

/* Ensure DataGrid has proper background */
.main-content .bg-white {
  background-color: white;
}

/* Critical fix for mobile sidebar overlay */
@media (max-width: 1023px) {
  .main-content {
    background-color: #f9fafb;
    position: relative;
    z-index: 1;
  }

  /* Ensure sidebar doesn't interfere with main content */
  .sidebar {
    position: fixed;
    background-color: white;
    left: 0;
    top: 0;
    height: calc(100vh-60px);
    margin-top: 60px;
  }

  /* Ensure sidebar content is visible */
  .sidebar * {
    visibility: visible;
    opacity: 1;
  }

  /* Force sidebar header and nav to be visible */
  .sidebar .p-4 {
    background-color: white;
    color: #1f2937;
  }

  /* Active menu item styling */
  .sidebar .active-menu-item {
    background-color: #bfdbfe;
  }

  .sidebar .font-bold {
    font-weight: 700;
  }

  .sidebar nav {
    background-color: white;
    color: #1f2937;
  }

  .sidebar nav div {
    color: #1f2937;
    background-color: transparent;
  }

  /* Critical fix for sidebar visibility */
  .sidebar.translate-x-0 {
    transform: translateX(0) !important;
    left: 0;
    visibility: visible;
    opacity: 1;
  }
}

/* Mobile sidebar overlay fixes */
@media (max-width: 1023px) {
  .sidebar-open .main-content {
    background-color: #f9fafb;
  }

  /* Ensure sidebar doesn't cover the entire screen */
  .sidebar-open .sidebar {
    height: 100vh;
    top: 0;
    left: 0;
  }

  /* Ensure main content is visible behind sidebar */
  .sidebar-open .main-content {
    position: relative;
    z-index: 10;
  }

  /* Enhanced backdrop overlay */
  .bg-black.bg-opacity-50 {
    backdrop-filter: blur(2px);
  }

  /* Improved sidebar slide animation */
  .sidebar {
    will-change: transform;
    transform: translateX(-100%);
  }

  .sidebar.translate-x-0 {
    transform: translateX(0);
  }
}

/* Active menu item styling - available for all screen sizes */
.active-menu-item {
  background-color: #bfdbfe !important;
  font-weight: 700 !important;
}

/* Hover state for non-active menu items */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6 !important;
}

/* Ensure sidebar navigation items are properly interactive */
.sidebar nav div {
  pointer-events: auto !important;
  cursor: pointer !important;
  user-select: none;
  position: relative;
}

/* Enhanced sidebar item styling */
.sidebar nav div:hover {
  background-color: #f3f4f6 !important;
  transition: all 0.2s ease;
}

/* Active menu item enhanced styling */
.sidebar nav div.active-menu-item {
  background-color: #bfdbfe !important;
  font-weight: 700 !important;
  padding-left: 12px;
}

/* Enhanced sidebar styling */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Smooth hover effects for sidebar items */
.sidebar-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-item:hover {
  /* Hover effect removed */
}

/* Mobile-specific styles */
@media (max-width: 1023px) {
  .lg\:hidden {
    display: block;
  }

  .lg\:relative {
    position: fixed;
  }

  .lg\:translate-x-0 {
    transform: translateX(-100%);
  }
}

@media (min-width: 1024px) {
  .lg\:hidden {
    display: none;
  }

  .lg\:relative {
    position: relative;
  }

  .lg\:translate-x-0 {
    transform: translateX(0);
  }
}

/* Custom scrollbar for sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Enhanced focus management for accessibility */
.sidebar [tabindex="0"]:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Smooth focus transitions */
.sidebar [tabindex="0"] {
  transition: outline 0.2s ease-in-out;
}

/* Prevent focus outline on click */
.sidebar [tabindex="0"]:focus:not(:focus-visible) {
  outline: none;
}

/* Enhanced mobile touch targets */
@media (max-width: 1023px) {
  .sidebar [tabindex="0"] {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}
</style>