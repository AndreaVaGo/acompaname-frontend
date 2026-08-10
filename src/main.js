import { createApp } from 'vue'
import './style.css'
import './styles/variables.css'
import './styles/base.css'
import App from './App.vue'
import router from './router'
import pinia from './pinia/pinia'


createApp(App).use(router).use(pinia).mount('#app')
