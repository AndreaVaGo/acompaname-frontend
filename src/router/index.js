import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import BuscarView from '../views/BuscarView.vue'
import SolicitudesCuidadorView from '../views/SolicitudesCuidadorView.vue'
import HistorialView from '../views/HistorialView.vue'
import PerfilCuidadorView from '../views/PerfilCuidadorView.vue'
import SolicitarServicioView from '../views/SolicitarServicioView.vue'
import ConfirmacionView from '../views/ConfirmacionView.vue'
import ValorarView from '../views/ValorarView.vue'
import EditarPerfilCuidadorView from '../views/EditarPerfilCuidadorView.vue'
import MiPerfilView from '../views/MiPerfilView.vue'
import SolicitudesFamiliaView from '../views/SolicitudesFamiliaView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/registro', name: 'registro', component: RegisterView },
    { path: '/buscar', name: 'buscar', component: BuscarView },
    { path: '/solicitudes-cuidador', name: 'solicitudes-cuidador', component: SolicitudesCuidadorView }, { path: '/historial', name: 'historial', component: HistorialView }, 
    { path: '/cuidador/:id', name: 'perfil-cuidador', component: PerfilCuidadorView }, 
    { path: '/solicitar/:id', name: 'solicitar', component: SolicitarServicioView }, 
    { path: '/confirmacion', name: 'confirmacion', component: ConfirmacionView }, 
    { path: '/valorar/:id', name: 'valorar', component: ValorarView },
    { path: '/editar-perfil', name: 'editar-perfil', component: EditarPerfilCuidadorView },
    { path: '/mi-perfil', name: 'mi-perfil', component: MiPerfilView }, 
    { path: '/solicitudes', name: 'solicitudes', component: SolicitudesFamiliaView }
    
  ]
})

export default router