import { createRouter, createWebHistory } from 'vue-router'
import pinia from '../pinia/pinia'
import { useAuthStore } from '../stores/auth'
import LandingView from '../views/comun/LandingView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import BuscarView from '../views/familia/BuscarView.vue'
import SolicitudesCuidadorView from '../views/cuidador/SolicitudesCuidadorView.vue'
import EditarPerfilView from '../views/cuidador/EditarPerfilView.vue'
import HistorialView from '../views/comun/HistorialView.vue'
import PerfilCuidadorView from '../views/familia/PerfilCuidadorView.vue'
import SolicitarServicioView from '../views/familia/SolicitarServicioView.vue'
import ConfirmacionView from '../views/familia/ConfirmacionView.vue'
import ValorarView from '../views/familia/ValorarView.vue'
import MiPerfilView from '../views/comun/MiPerfilView.vue'
import SolicitudesFamiliaView from '../views/familia/SolicitudesFamiliaView.vue'
import CheckoutView from '../views/familia/CheckoutView.vue'

// Las rutas con meta.requiereLogin solo se pueden ver con la sesión iniciada
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/registro', name: 'registro', component: RegisterView },
    { path: '/buscar', name: 'buscar', component: BuscarView },
    { path: '/cuidador/:id', name: 'perfil-cuidador', component: PerfilCuidadorView },
    { path: '/solicitudes-cuidador', name: 'solicitudes-cuidador', component: SolicitudesCuidadorView, meta: { requiereLogin: true } },
    { path: '/editar-perfil', name: 'editar-perfil', component: EditarPerfilView, meta: { requiereLogin: true } },
    { path: '/historial', name: 'historial', component: HistorialView, meta: { requiereLogin: true } },
    { path: '/solicitar/:id', name: 'solicitar', component: SolicitarServicioView, meta: { requiereLogin: true } },
    { path: '/confirmacion', name: 'confirmacion', component: ConfirmacionView, meta: { requiereLogin: true } },
    { path: '/valorar/:id', name: 'valorar', component: ValorarView, meta: { requiereLogin: true } },
    { path: '/mi-perfil', name: 'mi-perfil', component: MiPerfilView, meta: { requiereLogin: true } },
    { path: '/solicitudes', name: 'solicitudes', component: SolicitudesFamiliaView, meta: { requiereLogin: true } },
    { path: '/pagar/:id', name: 'pagar', component: CheckoutView, meta: { requiereLogin: true } }
  ]
})

// Si la ruta pide sesión y no hay, se manda al login
router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  if (to.meta.requiereLogin && !authStore.estaAutenticado) {
    return { name: 'login' }
  }
})

export default router