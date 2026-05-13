import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { Temporal } from '@js-temporal/polyfill'
const app = createApp(App)
app.config.globalProperties.$temporal = Temporal
app.mount('#app')
