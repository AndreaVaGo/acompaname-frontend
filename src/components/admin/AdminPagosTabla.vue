<script setup>
import { ref, computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";
import { formatearFecha } from "@/utils/formatearFecha";
import { nombreTipo, colorTipo } from "@/utils/nombreTipo";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";

// Tabla de pagos con botones de estado (el filtro lo hace el servidor, cada botón lleva el color
// de su píldora) y buscador por familia o cuidador (lo hace el propio componente).
// estado es lo que está elegido en el filtro ("" = todos).
const props = defineProps({
  pagos: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

// Cada estado lleva el color de su píldora
const ESTADOS = [
  { valor: "", nombre: "Todos", color: "neutro" },
  { valor: "PENDIENTE", nombre: "Pendiente", color: "naranja" },
  { valor: "COMPLETADO", nombre: "Cobrado", color: "verde" },
  { valor: "CANCELADO", nombre: "Cancelado", color: "gris" },
];

const busqueda = ref("");

// Los pagos que coinciden con lo escrito en el buscador (sin mirar mayúsculas)
const pagosMostrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (texto === "") {
    return props.pagos;
  }
  return props.pagos.filter((pago) => {
    return (
      pago.nombreFamilia.toLowerCase().includes(texto) ||
      pago.nombreCuidador.toLowerCase().includes(texto)
    );
  });
});

const totalMostrado = computed(() => {
  let suma = 0;
  for (const pago of pagosMostrados.value) {
    suma = suma + pago.importe;
  }
  return suma;
});

// Color de la píldora del estado (el mismo que el de su botón del filtro)
function colorEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.color;
    }
  }
  return "gris";
}

function nombreEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.nombre;
    }
  }
  return estado;
}

// Solo los pagos pendientes tienen días sin cobrar
function diasSinCobrar(pago) {
  if (pago.estado !== "PENDIENTE") {
    return "—";
  }
  if (pago.diasDesdeCreacion === 1) {
    return "1 día";
  }
  return pago.diasDesdeCreacion + " días";
}

// Mismo criterio que el aviso del panel: pendiente desde hace más de una semana
function estaRetrasado(pago) {
  return pago.estado === "PENDIENTE" && pago.diasDesdeCreacion > 7;
}

// Color de los días sin cobrar: rojo si se retrasa, naranja si está pendiente y gris si no aplica
function claseDias(pago) {
  if (estaRetrasado(pago)) {
    return "admin-pagos-tabla__dias--retrasado";
  }
  if (pago.estado === "PENDIENTE") {
    return "admin-pagos-tabla__dias--pendiente";
  }
  return "admin-pagos-tabla__dias--ninguno";
}

function textoPagos(cantidad) {
  if (cantidad === 1) {
    return "1 pago";
  }
  return cantidad + " pagos";
}
</script>

<template>
  <section class="admin-pagos-tabla">
    <div class="admin-pagos-tabla__cabecera">
      <h2 class="admin-pagos-tabla__titulo">Detalle de pagos</h2>

      <input
        v-model="busqueda"
        type="search"
        class="admin-pagos-tabla__buscador"
        placeholder="Buscar por familia o persona cuidadora"
        aria-label="Buscar por familia o persona cuidadora"
      />
    </div>

    <AdminFiltros
      :opciones="ESTADOS"
      :elegido="estado"
      etiqueta="Filtrar por estado"
      @elegir="emit('cambiarEstado', $event)"
    />

    <p v-if="pagos.length === 0" class="admin-pagos-tabla__vacio">
      No hay pagos con este estado.
    </p>
    <p v-else-if="pagosMostrados.length === 0" class="admin-pagos-tabla__vacio">
      Ningún pago coincide con la búsqueda.
    </p>

    <template v-else>
      <div class="admin-pagos-tabla__tabla">
        <table>
          <thead>
            <tr>
              <th>Familia</th>
              <th>Persona cuidadora</th>
              <th>Tipo</th>
              <th>Importe</th>
              <th>Fecha</th>
              <th>Sin cobrar</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pago in pagosMostrados" :key="pago.id">
              <td data-label="Familia">{{ pago.nombreFamilia }}</td>
              <td data-label="Persona cuidadora">{{ pago.nombreCuidador }}</td>
              <td data-label="Tipo">
                <AdminPildora :color="colorTipo(pago.tipoCuidado)">
                  {{ nombreTipo(pago.tipoCuidado) }}
                </AdminPildora>
              </td>
              <td data-label="Importe" class="admin-pagos-tabla__importe">
                {{ formatearEuros(pago.importe) }}
              </td>
              <td data-label="Fecha">
                <span class="admin-pagos-tabla__fecha">{{ formatearFecha(pago.fecha) }}</span>
              </td>
              <td
                data-label="Sin cobrar"
                :class="{ 'admin-pagos-tabla__retrasado': estaRetrasado(pago) }"
              >
                <span class="admin-pagos-tabla__dias" :class="claseDias(pago)">
                  {{ diasSinCobrar(pago) }}
                </span>
              </td>
              <td data-label="Estado">
                <AdminPildora :color="colorEstado(pago.estado)" punto>
                  {{ nombreEstado(pago.estado) }}
                </AdminPildora>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="admin-pagos-tabla__pie">
        {{ textoPagos(pagosMostrados.length) }} · Total {{ formatearEuros(totalMostrado) }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.admin-pagos-tabla {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-pagos-tabla__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-pagos-tabla__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__buscador {
  min-width: 240px;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}


.admin-pagos-tabla__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-pagos-tabla__pie {
  margin: 14px 0 0;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

/* En pantallas medianas la tabla se desliza hacia los lados en vez de desbordar la página */
.admin-pagos-tabla__tabla {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th {
  text-align: left;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  padding: 10px 12px;
  border-bottom: 2px solid var(--color-accent-bg);
  /* Las palabras no se parten: si no caben, la tabla se desliza */
  white-space: nowrap;
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--color-neutral-bg);
  font-size: 0.9rem;
  white-space: nowrap;
}

tr:last-child td {
  border-bottom: none;
}

/* Importe en negrita */
.admin-pagos-tabla__importe {
  font-weight: bold;
}

/* Fecha en una pastilla suave y en negrita */
.admin-pagos-tabla__fecha {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-input);
  background-color: var(--color-neutral-bg);
  font-weight: bold;
}

/* Sin cobrar: rojo si se retrasa (más de 7 días), naranja si está pendiente y gris si no aplica */
.admin-pagos-tabla__dias {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.admin-pagos-tabla__dias--retrasado {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
}

.admin-pagos-tabla__dias--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__dias--ninguno {
  padding: 4px 0;
  color: var(--color-text-muted);
}

/* En el móvil cada pago se ve como una tarjeta: etiqueta a la izquierda y valor a la derecha */
@media (max-width: 640px) {
  .admin-pagos-tabla__buscador {
    min-width: 0;
    width: 100%;
  }

  .admin-pagos-tabla__tabla {
    overflow-x: visible;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    border: 1px solid var(--color-neutral-bg);
    border-radius: var(--radius-input);
    margin-bottom: 12px;
    padding: 4px 12px;
  }

  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    text-align: right;
    white-space: normal;
  }

  td::before {
    content: attr(data-label);
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--color-text-muted);
    text-align: left;
    flex-shrink: 0;
  }

  tr:last-child td {
    border-bottom: 1px solid var(--color-neutral-bg);
  }

  tr td:last-child {
    border-bottom: none;
  }
}
</style>