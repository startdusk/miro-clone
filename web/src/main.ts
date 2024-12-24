import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './tailwindcss.css'

import router from './router/index'

import UndoIcon from './components/icons/UndoIcon.vue'
import RedoIcon from './components/icons/RedoIcon.vue';
import PersonPlusIcon from './components/icons/PersonPlusIcon.vue';
import TrashIcon from './components/icons/TrashIcon.vue';
import ArrowTopIcon from './components/icons/ArrowTopIcon.vue';
import StickyNoteIcon from './components/icons/StickyNoteIcon.vue';
import DocumentIcon from './components/icons/DocumentIcon.vue';
import ArrowDownIcon from './components/icons/ArrowDownIcon.vue'

function registerIcons(app: any) {
  app.component('StickyNoteIcon', StickyNoteIcon);
  app.component('DocumentIcon', DocumentIcon);
  app.component('ArrowTopIcon', ArrowTopIcon);
  app.component('TrashIcon', TrashIcon);
  app.component('PersonPlusIcon', PersonPlusIcon);
  app.component('RedoIcon', RedoIcon);
  app.component('UndoIcon', UndoIcon);
  app.component('ArrowDownIcon', ArrowDownIcon);
}

const app = createApp(App)
app.use(router)
registerIcons(app)
app.use(createPinia())
app.mount('#app')
