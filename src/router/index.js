import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import BuscarView from '../views/BuscarView.vue'
import SolicitudesCuidadorView from '../views/SolicitudesCuidadorView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/registro', name: 'registro', component: RegisterView },
    { path: '/buscar', name: 'buscar', component: BuscarView },
    { path: '/solicitudes-cuidador', name: 'solicitudes-cuidador', component: SolicitudesCuidadorView }
  ]
})

export default router