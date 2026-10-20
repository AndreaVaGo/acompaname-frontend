<script setup>
import { ref, computed, onMounted } from "vue";
import AdminRepository from "@/repositories/AdminRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import AdminAvisos from "@/components/admin/AdminAvisos.vue";
import AdminTarjetas from "@/components/admin/AdminTarjetas.vue";
import AdminBarras from "@/components/admin/AdminBarras.vue";
import AdminPagos from "@/components/admin/AdminPagos.vue";
import AdminCuidadores from "@/components/admin/AdminCuidadores.vue";
import AdminValoraciones from "@/components/admin/AdminValoraciones.vue";
import AdminUsuarios from "@/components/admin/AdminUsuarios.vue";
import AdminSolicitudes from "@/components/admin/AdminSolicitudes.vue";

const adminRepository = new AdminRepository();
const authStore = useAuthStore();

const cargando = ref(true);
const error = ref("");
// Mensajes que salen después de una acción (bloquear, eliminar...)
const mensajeOk = ref("");
const mensajeError = ref("");

const estadisticas = ref(null);
const avisos = ref(null);
const cuidadores = ref([]);
const valoraciones = ref([]);
const usuarios = ref([]);
const solicitudes = ref([]);
// Estado elegido en el filtro de solicitudes ("" = todas)
const estadoFiltro = ref("");

// Filas de la tarjeta «Solicitudes por estado»
const filasEstado = computed(() => {
  if (!estadisticas.value) {
    return [];
  }
  return [
    { texto: "Pendientes", cantidad: estadisticas.value.solicitudesPendientes, color: "var(--color-accent)" },
    { texto: "Aceptadas", cantidad: estadisticas.value.solicitudesAceptadas, color: "var(--color-secondary)" },
    { texto: "Completadas", cantidad: estadisticas.value.solicitudesCompletadas, color: "var(--color-info)" },
    { texto: "Rechazadas", cantidad: estadisticas.value.solicitudesRechazadas, color: "var(--color-text-muted)" },
  ];
});

// Filas de la tarjeta «Tipo de cuidado»
const filasTipo = computed(() => {
  if (!estadisticas.value) {
    return [];
  }
  return [
    { texto: "Hospitalario", cantidad: estadisticas.value.solicitudesHospital, color: "var(--color-info)" },
    { texto: "Domicilio", cantidad: estadisticas.value.solicitudesDomicilio, color: "var(--color-secondary)" },
  ];
});

// Nota de la tarjeta de tipo de cuidado: el tiempo medio llega con punto (5.5) y se muestra con coma (5,5)
const notaTipo = computed(() => {
  if (!estadisticas.value) {
    return "";
  }
  const horas = estadisticas.value.horasMediasHastaAceptar;
  if (horas === null) {
    return "Todavía no se ha aceptado ninguna solicitud.";
  }
  return "Tiempo medio hasta aceptar una solicitud: " + String(horas).replace(".", ",") + " h.";
});

async function cargarTodo() {
  try {
    estadisticas.value = await adminRepository.getEstadisticas();
    avisos.value = await adminRepository.getAvisos();
    cuidadores.value = await adminRepository.getMejoresCuidadores();
    valoraciones.value = await adminRepository.getUltimasValoraciones();
    usuarios.value = await adminRepository.getUsuarios();
    solicitudes.value = await adminRepository.getSolicitudes(estadoFiltro.value);
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar el panel.");
  } finally {
    cargando.value = false;
  }
}

onMounted(cargarTodo);

function limpiarMensajes() {
  mensajeOk.value = "";
  mensajeError.value = "";
}

// Cambia el filtro y vuelve a pedir las solicitudes de ese estado
async function cambiarEstado(estado) {
  limpiarMensajes();
  estadoFiltro.value = estado;
  try {
    solicitudes.value = await adminRepository.getSolicitudes(estado);
  } catch (err) {
    mensajeError.value = mensajeDeError(err, "No se pudieron cargar las solicitudes.");
  }
}

// El botón de los avisos filtra las solicitudes pendientes y baja hasta la tabla
async function verPendientes() {
  await cambiarEstado("PENDIENTE");
  const seccion = document.getElementById("solicitudes");
  if (seccion && seccion.scrollIntoView) {
    seccion.scrollIntoView({ behavior: "smooth" });
  }
}

// Bloquea al usuario si estaba activo y lo desbloquea si estaba bloqueado
async function cambiarActivo(usuario) {
  limpiarMensajes();
  const nuevoActivo = !usuario.activo;
  try {
    await adminRepository.cambiarActivo(usuario.id, nuevoActivo);
    usuarios.value = await adminRepository.getUsuarios();
    if (nuevoActivo) {
      mensajeOk.value = "Usuario desbloqueado.";
    } else {
      mensajeOk.value = "Usuario bloqueado.";
    }
  } catch (err) {
    mensajeError.value = mensajeDeError(err, "No se pudo cambiar el estado del usuario.");
  }
}

// Al borrar una valoración cambian la lista, la nota de los cuidadores y la media
async function eliminarValoracion(id) {
  limpiarMensajes();
  try {
    await adminRepository.borrarValoracion(id);
    valoraciones.value = await adminRepository.getUltimasValoraciones();
    cuidadores.value = await adminRepository.getMejoresCuidadores();
    estadisticas.value = await adminRepository.getEstadisticas();
    mensajeOk.value = "Valoración eliminada.";
  } catch (err) {
    mensajeError.value = mensajeDeError(err, "No se pudo eliminar la valoración.");
  }
}
</script>

<template>
  <div class="admin">
    <header>
      <h1>Panel de administración</h1>
      <p class="admin__subtitulo">Resumen de la actividad de Acompáñame.</p>
    </header>

    <p v-if="cargando" class="admin__estado">Cargando el panel...</p>
    <p v-else-if="error" class="admin__error" role="alert">{{ error }}</p>

    <template v-else>
      <p v-if="mensajeOk" class="admin__ok" role="status">{{ mensajeOk }}</p>
      <p v-if="mensajeError" class="admin__error" role="alert">{{ mensajeError }}</p>

      <AdminAvisos :avisos="avisos" @ver-pendientes="verPendientes" />

      <AdminTarjetas :estadisticas="estadisticas" />

      <section class="admin__fila">
        <AdminBarras titulo="Solicitudes por estado" :filas="filasEstado" />
        <AdminBarras titulo="Tipo de cuidado" :filas="filasTipo" :nota="notaTipo" />
        <AdminPagos
          :cobrados="estadisticas.ingresosCobrados"
          :pendientes="estadisticas.ingresosPendientes"
        />
      </section>

      <section class="admin__fila">
        <AdminCuidadores :cuidadores="cuidadores" />
        <AdminValoraciones :valoraciones="valoraciones" @eliminar="eliminarValoracion" />
      </section>

      <AdminUsuarios
        :usuarios="usuarios"
        :id-propio="authStore.id"
        @cambiar-activo="cambiarActivo"
      />

      <AdminSolicitudes
        :solicitudes="solicitudes"
        :estado="estadoFiltro"
        @cambiar-estado="cambiarEstado"
      />
    </template>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1152px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-family: var(--font-base);
  color: var(--color-text);
}

.admin h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.admin__subtitulo {
  color: var(--color-text-muted);
  margin: 0;
}

.admin__estado {
  margin: 0;
  color: var(--color-text-muted);
}

.admin__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0;
}

.admin__ok {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  font-weight: bold;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0;
}

.admin__fila {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-md);
}

@media (max-width: 768px) {
  .admin {
    padding: 16px 16px 32px;
  }
}
</style>