import { createRouter, createWebHistory } from 'vue-router'
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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/registro', name: 'registro', component: RegisterView },
    { path: '/buscar', name: 'buscar', component: BuscarView },
    { path: '/solicitudes-cuidador', name: 'solicitudes-cuidador', component: SolicitudesCuidadorView },
    { path: '/editar-perfil', name: 'editar-perfil', component: EditarPerfilView },
    { path: '/historial', name: 'historial', component: HistorialView },
    { path: '/cuidador/:id', name: 'perfil-cuidador', component: PerfilCuidadorView },
    { path: '/solicitar/:id', name: 'solicitar', component: SolicitarServicioView },
    { path: '/confirmacion', name: 'confirmacion', component: ConfirmacionView },
    { path: '/valorar/:id', name: 'valorar', component: ValorarView },
    { path: '/mi-perfil', name: 'mi-perfil', component: MiPerfilView },
    { path: '/solicitudes', name: 'solicitudes', component: SolicitudesFamiliaView },
    { path: '/pagar/:id', name: 'pagar', component: CheckoutView }
    
  ]
})

export default router