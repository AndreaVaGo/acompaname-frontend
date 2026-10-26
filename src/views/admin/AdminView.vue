<script setup>
import { ref, computed, onMounted } from "vue";
import AdminRepository from "@/repositories/AdminRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import AdminMenu from "@/components/admin/AdminMenu.vue";
import AdminAvisos from "@/components/admin/AdminAvisos.vue";
import AdminTarjetas from "@/components/admin/AdminTarjetas.vue";
import AdminBarras from "@/components/admin/AdminBarras.vue";
import AdminPagos from "@/components/admin/AdminPagos.vue";
import AdminCuidadores from "@/components/admin/AdminCuidadores.vue";
import AdminValoraciones from "@/components/admin/AdminValoraciones.vue";
import AdminUsuarios from "@/components/admin/AdminUsuarios.vue";
import AdminSolicitudes from "@/components/admin/AdminSolicitudes.vue";
import AdminPagosTarjetas from "@/components/admin/AdminPagosTarjetas.vue";
import AdminPagosMeses from "@/components/admin/AdminPagosMeses.vue";
import AdminPagosBarras from "@/components/admin/AdminPagosBarras.vue";
import AdminPagosTabla from "@/components/admin/AdminPagosTabla.vue";

const adminRepository = new AdminRepository();
const authStore = useAuthStore();

// Secciones del menú del panel
const secciones = [
  { id: "resumen", texto: "Resumen" },
  { id: "solicitudes", texto: "Solicitudes" },
  { id: "pagos", texto: "Pagos" },
  { id: "usuarios", texto: "Usuarios" },
];
// Sección que se está viendo: solo se muestra una a la vez
const seccion = ref("resumen");

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
const pagosResumen = ref(null);
const pagos = ref([]);
// Estado elegido en el filtro de solicitudes ("" = todas)
const estadoFiltro = ref("");
// Estado elegido en el filtro de pagos ("" = todos)
const estadoPagos = ref("");

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

// «1 pago» o «3 pagos»
function textoPagos(cantidad) {
  if (cantidad === 1) {
    return "1 pago";
  }
  return cantidad + " pagos";
}

// Filas de «Facturado por tipo de cuidado» en la pestaña Pagos
const filasTipoPago = computed(() => {
  if (!pagosResumen.value) {
    return [];
  }
  const filas = [];
  for (const tipo of pagosResumen.value.porTipoCuidado) {
    const nombre = tipo.tipoCuidado.charAt(0).toUpperCase() + tipo.tipoCuidado.slice(1);
    filas.push({ texto: nombre, importe: tipo.importe, detalle: textoPagos(tipo.pagos) });
  }
  return filas;
});

// Filas de «Cuidadores que más han cobrado» en la pestaña Pagos
const filasCuidadoresPago = computed(() => {
  if (!pagosResumen.value) {
    return [];
  }
  const filas = [];
  for (const cuidador of pagosResumen.value.topCuidadores) {
    filas.push({
      texto: cuidador.nombre,
      importe: cuidador.importeCobrado,
      detalle: textoPagos(cuidador.pagos),
    });
  }
  return filas;
});

async function cargarTodo() {
  try {
    estadisticas.value = await adminRepository.getEstadisticas();
    avisos.value = await adminRepository.getAvisos();
    cuidadores.value = await adminRepository.getMejoresCuidadores();
    valoraciones.value = await adminRepository.getUltimasValoraciones();
    usuarios.value = await adminRepository.getUsuarios();
    solicitudes.value = await adminRepository.getSolicitudes(estadoFiltro.value);
    pagosResumen.value = await adminRepository.getPagosResumen();
    pagos.value = await adminRepository.getPagos(estadoPagos.value);
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

// Cambia de sección y quita los mensajes de la sección anterior
function cambiarSeccion(id) {
  limpiarMensajes();
  seccion.value = id;
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

// Cambia el filtro y vuelve a pedir los pagos de ese estado
async function cambiarEstadoPagos(estado) {
  limpiarMensajes();
  estadoPagos.value = estado;
  try {
    pagos.value = await adminRepository.getPagos(estado);
  } catch (err) {
    mensajeError.value = mensajeDeError(err, "No se pudieron cargar los pagos.");
  }
}

// El botón de los avisos filtra las solicitudes pendientes y abre la sección Solicitudes
async function verPendientes() {
  seccion.value = "solicitudes";
  await cambiarEstado("PENDIENTE");
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

    <div v-else class="admin__cuerpo">
      <AdminMenu :secciones="secciones" :activa="seccion" @cambiar="cambiarSeccion" />

      <div class="admin__contenido">
        <p v-if="mensajeOk" class="admin__ok" role="status">{{ mensajeOk }}</p>
        <p v-if="mensajeError" class="admin__error" role="alert">{{ mensajeError }}</p>

        <template v-if="seccion === 'resumen'">
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
        </template>

        <AdminSolicitudes
          v-else-if="seccion === 'solicitudes'"
          :solicitudes="solicitudes"
          :estado="estadoFiltro"
          @cambiar-estado="cambiarEstado"
        />

        <template v-else-if="seccion === 'pagos'">
          <AdminPagosTarjetas :resumen="pagosResumen" />

          <section class="admin__fila">
            <AdminPagosMeses :meses="pagosResumen.porMes" />
          </section>

          <section class="admin__fila">
            <AdminPagosBarras titulo="Facturado por tipo de cuidado" :filas="filasTipoPago" />
            <AdminPagosBarras
              titulo="Cuidadores que más han cobrado"
              :filas="filasCuidadoresPago"
              color="var(--color-info)"
              vacio="Todavía no hay cuidadores con pagos cobrados."
            />
          </section>

          <AdminPagosTabla
            :pagos="pagos"
            :estado="estadoPagos"
            @cambiar-estado="cambiarEstadoPagos"
          />
        </template>

        <AdminUsuarios
          v-else-if="seccion === 'usuarios'"
          :usuarios="usuarios"
          :id-propio="authStore.id"
          @cambiar-activo="cambiarActivo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  /* Ocupa todo el ancho disponible: sin esto, con margin auto se ensancha según su contenido */
  width: 100%;
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

/* Menú a la izquierda y la sección elegida a la derecha */
.admin__cuerpo {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: start;
}

.admin__contenido {
  /* Sin esto, una tabla ancha estira la columna y se sale de la pantalla */
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
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

  /* En móvil el menú queda arriba como una fila de pestañas */
  .admin__cuerpo {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>