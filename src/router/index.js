import { createRouter, createWebHistory } from "vue-router";
import pinia from "../pinia/pinia";
import { useAuthStore } from "../stores/auth";
import LandingView from "../views/common/LandingView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import OlvidePasswordView from "../views/auth/OlvidePasswordView.vue";
import RestablecerPasswordView from "../views/auth/RestablecerPasswordView.vue";
import BuscarView from "../views/family/BuscarView.vue";
import SolicitudesCuidadorView from "../views/caregiver/SolicitudesCuidadorView.vue";
import EditarPerfilView from "../views/caregiver/EditarPerfilView.vue";
import MiCalendarioView from "../views/caregiver/MiCalendarioView.vue";
import HistorialView from "../views/common/HistorialView.vue";
import PerfilCuidadorView from "../views/family/PerfilCuidadorView.vue";
import SolicitarServicioView from "../views/family/SolicitarServicioView.vue";
import ConfirmacionView from "../views/family/ConfirmacionView.vue";
import ValorarView from "../views/family/ValorarView.vue";
import MiPerfilView from "../views/common/MiPerfilView.vue";
import EditarDatosView from "../views/common/EditarDatosView.vue";
import CambiarPasswordView from "../views/common/CambiarPasswordView.vue";
import EnviarSugerenciaView from "../views/common/EnviarSugerenciaView.vue";
import SolicitudesFamiliaView from "../views/family/SolicitudesFamiliaView.vue";
import CheckoutView from "../views/family/CheckoutView.vue";
import PagosView from "../views/family/PagosView.vue";
import AvisoLegalView from "../views/common/AvisoLegalView.vue";
import PrivacidadView from "../views/common/PrivacidadView.vue";
import TerminosView from "../views/common/TerminosView.vue";
import AdminView from "../views/admin/AdminView.vue";
import NoEncontradoView from "../views/common/NoEncontradoView.vue";
import { aplicarMeta } from "../utils/metaPagina";

// Las rutas con meta.requiereLogin solo se pueden ver con la sesión iniciada
// Las rutas con meta.rol solo las puede ver ese rol (FAMILIA, CUIDADOR o ADMIN)
// Las rutas con meta.roles las pueden ver varios roles (por ejemplo ["FAMILIA", "CUIDADOR"])
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingView },
    { path: "/login", name: "login", component: LoginView, meta: { titulo: "Iniciar sesión", descripcion: "Inicia sesión en Acompáñame para gestionar tus solicitudes de cuidado." } },
    { path: "/registro", name: "registro", component: RegisterView, meta: { titulo: "Crear cuenta", descripcion: "Crea tu cuenta en Acompáñame como familia o como persona cuidadora." } },
    { path: "/olvide-password", name: "olvide-password", component: OlvidePasswordView, meta: { titulo: "Recuperar contraseña", descripcion: "Pide un enlace para elegir una contraseña nueva en Acompáñame." } },
    { path: "/restablecer-password", name: "restablecer-password", component: RestablecerPasswordView, meta: { titulo: "Elegir contraseña nueva", descripcion: "Elige una contraseña nueva para tu cuenta de Acompáñame." } },
    { path: "/buscar", name: "buscar", component: BuscarView, meta: { titulo: "Buscar personas cuidadoras", descripcion: "Busca personas cuidadoras de confianza por ciudad, tipo de cuidado y valoraciones." } },
    { path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView, meta: { titulo: "Perfil de la persona cuidadora", descripcion: "Conoce la experiencia, la tarifa y las valoraciones de esta persona cuidadora." } },
    { path: "/aviso-legal", name: "aviso-legal", component: AvisoLegalView, meta: { titulo: "Aviso legal", descripcion: "Información legal de Acompáñame." } },
    { path: "/privacidad", name: "privacidad", component: PrivacidadView, meta: { titulo: "Política de privacidad", descripcion: "Cómo trata Acompáñame tus datos personales." } },
    { path: "/terminos", name: "terminos", component: TerminosView, meta: { titulo: "Términos y condiciones", descripcion: "Condiciones de uso de Acompáñame." } },
    { path: "/solicitudes-cuidador", name: "solicitudes-cuidador", component: SolicitudesCuidadorView, meta: { titulo: "Solicitudes recibidas", requiereLogin: true, rol: "CUIDADOR" } },
    { path: "/editar-perfil", name: "editar-perfil", component: EditarPerfilView, meta: { titulo: "Editar mi perfil", requiereLogin: true, rol: "CUIDADOR" } },
    { path: "/mi-calendario", name: "mi-calendario", component: MiCalendarioView, meta: { titulo: "Mi calendario", requiereLogin: true, rol: "CUIDADOR" } },
    { path: "/historial", name: "historial", component: HistorialView, meta: { titulo: "Historial", requiereLogin: true } },
    { path: "/solicitar/:id", name: "solicitar", component: SolicitarServicioView, meta: { titulo: "Solicitar cuidado", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/confirmacion", name: "confirmacion", component: ConfirmacionView, meta: { titulo: "Solicitud enviada", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/valorar/:id", name: "valorar", component: ValorarView, meta: { titulo: "Valorar el servicio", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/mi-perfil", name: "mi-perfil", component: MiPerfilView, meta: { titulo: "Mi perfil", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/editar-datos", name: "editar-datos", component: EditarDatosView, meta: { titulo: "Editar mis datos", requiereLogin: true } },
    { path: "/cambiar-password", name: "cambiar-password", component: CambiarPasswordView, meta: { titulo: "Cambiar contraseña", requiereLogin: true } },
    { path: "/sugerencias", name: "sugerencias", component: EnviarSugerenciaView, meta: { titulo: "Enviar una sugerencia", requiereLogin: true, roles: ["FAMILIA", "CUIDADOR"] } },
    { path: "/solicitudes", name: "solicitudes", component: SolicitudesFamiliaView, meta: { titulo: "Mis solicitudes", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/pagos", name: "pagos", component: PagosView, meta: { titulo: "Mis pagos", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/pagar/:id", name: "pagar", component: CheckoutView, meta: { titulo: "Pagar", requiereLogin: true, rol: "FAMILIA" } },
    { path: "/admin", name: "admin", component: AdminView, meta: { titulo: "Administración", requiereLogin: true, rol: "ADMIN" } },
    // Va la última: recoge cualquier dirección que no exista
    { path: "/:pathMatch(.*)*", name: "no-encontrado", component: NoEncontradoView, meta: { titulo: "Página no encontrada" } },
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

  // Lo mismo si la ruta admite varios roles y el usuario no tiene ninguno de ellos
  if (to.meta.roles && !to.meta.roles.includes(authStore.rol)) {
    return { name: "landing" };
  }
});

// Al terminar cada navegación se pone el título y la descripción de la página
router.afterEach((to) => {
  aplicarMeta(to.meta);
});

export default router;