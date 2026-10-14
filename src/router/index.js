import { createRouter, createWebHistory } from "vue-router";
import pinia from "../pinia/pinia";
import { useAuthStore } from "../stores/auth";
import LandingView from "../views/common/LandingView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import BuscarView from "../views/familia/BuscarView.vue";
import SolicitudesCuidadorView from "../views/cuidador/SolicitudesCuidadorView.vue";
import EditarPerfilView from "../views/cuidador/EditarPerfilView.vue";
import HistorialView from "../views/common/HistorialView.vue";
import PerfilCuidadorView from "../views/familia/PerfilCuidadorView.vue";
import SolicitarServicioView from "../views/familia/SolicitarServicioView.vue";
import ConfirmacionView from "../views/familia/ConfirmacionView.vue";
import ValorarView from "../views/familia/ValorarView.vue";
import MiPerfilView from "../views/common/MiPerfilView.vue";
import EditarDatosView from "../views/common/EditarDatosView.vue";
import CambiarPasswordView from "../views/common/CambiarPasswordView.vue";
import SolicitudesFamiliaView from "../views/familia/SolicitudesFamiliaView.vue";
import CheckoutView from "../views/familia/CheckoutView.vue";

// Las rutas con meta.requiereLogin solo se pueden ver con la sesión iniciada
// Las rutas con meta.rol solo las puede ver ese rol (FAMILIA o CUIDADOR)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/registro", name: "registro", component: RegisterView },
    { path: "/buscar", name: "buscar", component: BuscarView },
    { path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView },
    { path: "/solicitudes-cuidador", name: "solicitudes-cuidador", component: SolicitudesCuidadorView, meta: { requiereLogin: true, rol: "CUIDADOR" } },
    { path: "/editar-perfil", name: "editar-perfil", component: EditarPerfilView, meta: { requiereLogin: true, rol: "CUIDADOR" } },
    { path: "/historial", name: "historial", component: HistorialView, meta: { requiereLogin: true } },
    { path: "/solicitar/:id", name: "solicitar", component: SolicitarServicioView, meta: { requiereLogin: true, rol: "FAMILIA" } },
    { path: "/confirmacion", name: "confirmacion", component: ConfirmacionView, meta: { requiereLogin: true, rol: "FAMILIA" } },
    { path: "/valorar/:id", name: "valorar", component: ValorarView, meta: { requiereLogin: true, rol: "FAMILIA" } },
    { path: "/mi-perfil", name: "mi-perfil", component: MiPerfilView, meta: { requiereLogin: true, rol: "FAMILIA" } },
    { path: "/editar-datos", name: "editar-datos", component: EditarDatosView, meta: { requiereLogin: true } },
    { path: "/cambiar-password", name: "cambiar-password", component: CambiarPasswordView, meta: { requiereLogin: true } },
    { path: "/solicitudes", name: "solicitudes", component: SolicitudesFamiliaView, meta: { requiereLogin: true, rol: "FAMILIA" } },
    { path: "/pagar/:id", name: "pagar", component: CheckoutView, meta: { requiereLogin: true, rol: "FAMILIA" } },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia);

  // Si la ruta pide sesión y no hay, se manda al login
  if (to.meta.requiereLogin && !authStore.estaAutenticado) {
    return { name: "login" };
  }

  // Si la ruta es solo para un rol y el usuario tiene otro, se manda al inicio
  if (to.meta.rol && to.meta.rol !== authStore.rol) {
    return { name: "landing" };
  }
});

export default router;