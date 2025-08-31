import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/tailwind.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize local database store
const { useLocalDatabaseStore } = await import('./stores/localDatabaseStore.js')
const localDatabaseStore = useLocalDatabaseStore()
await localDatabaseStore.initStore()

app.mount('#app')