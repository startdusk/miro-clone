import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './tailwindcss.css'

import router from './router/index'

const importIcons = import.meta.glob('./components/icons/**/*.vue')

async function registerIcons(app: any) {
  for (const path of Object.keys(importIcons)) {
    const pathArr = path.split('/')
    const filename = pathArr.pop()
    const realFilename = filename?.split('.')[0]
    if (realFilename) {
      const component = await importIcons[path]()
      app.component(realFilename, (component as any).default)
    }
  }
}
const app = createApp(App)
app.use(router)
app.use(createPinia())
await registerIcons(app)
app.mount('#app')

