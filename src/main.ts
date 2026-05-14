import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { Temporal } from '@js-temporal/polyfill'

Object.assign(globalThis, { Temporal })

createApp(App).mount('#app')
