<script setup>
import { ref, computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";
import { formatearFecha } from "@/utils/formatearFecha";

// Tabla de pagos con filtro por estado (lo hace el servidor) y buscador por familia o cuidador
// (lo hace el propio componente). estado es lo que está elegido en el filtro ("" = todos).
const props = defineProps({
  pagos: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

const ESTADOS = [
  { valor: "", nombre: "Todos" },
  { valor: "PENDIENTE", nombre: "Pendiente" },
  { valor: "COMPLETADO", nombre: "Cobrado" },
  { valor: "CANCELADO", nombre: "Cancelado" },
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

// El tipo llega en minúsculas (hospitalario) y se enseña con la primera en mayúscula
function nombreTipo(tipo) {
  if (!tipo) {
    return "";
  }
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
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

      <div class="admin-pagos-tabla__controles">
        <input
          v-model="busqueda"
          type="search"
          class="admin-pagos-tabla__buscador"
          placeholder="Buscar por familia o cuidador"
          aria-label="Buscar por familia o cuidador"
        />
        <label class="admin-pagos-tabla__filtro">
          <span>Estado</span>
          <select :value="estado" @change="emit('cambiarEstado', $event.target.value)">
            <option v-for="opcion in ESTADOS" :key="opcion.valor" :value="opcion.valor">
              {{ opcion.nombre }}
            </option>
          </select>
        </label>
      </div>
    </div>

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
              <th>Cuidador</th>
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
              <td data-label="Cuidador">{{ pago.nombreCuidador }}</td>
              <td data-label="Tipo">{{ nombreTipo(pago.tipoCuidado) }}</td>
              <td data-label="Importe">{{ formatearEuros(pago.importe) }}</td>
              <td data-label="Fecha">{{ formatearFecha(pago.fecha) }}</td>
              <td
                data-label="Sin cobrar"
                :class="{ 'admin-pagos-tabla__retrasado': estaRetrasado(pago) }"
              >
                {{ diasSinCobrar(pago) }}
              </td>
              <td data-label="Estado">
                <span
                  class="admin-pagos-tabla__pildora"
                  :class="'admin-pagos-tabla__pildora--' + pago.estado.toLowerCase()"
                >
                  {{ nombreEstado(pago.estado) }}
                </span>
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
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-pagos-tabla__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.admin-pagos-tabla__buscador,
.admin-pagos-tabla__filtro select {
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}

.admin-pagos-tabla__buscador {
  min-width: 240px;
}

.admin-pagos-tabla__filtro {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: bold;
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

.admin-pagos-tabla__retrasado {
  color: var(--color-error);
  font-weight: bold;
}

.admin-pagos-tabla__pildora {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.admin-pagos-tabla__pildora--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__pildora--completado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-pagos-tabla__pildora--cancelado {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

/* En el móvil cada pago se ve como una tarjeta: etiqueta a la izquierda y valor a la derecha */
@media (max-width: 640px) {
  .admin-pagos-tabla__buscador {
    min-width: 0;
    width: 100%;
  }

  .admin-pagos-tabla__controles {
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