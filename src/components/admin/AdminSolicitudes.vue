<script setup>
import { formatearFecha } from "@/utils/formatearFecha";

// Tabla de solicitudes con botones de estado (cada uno con el mismo color que su píldora).
// estado es lo que está elegido en el filtro ("" = todas).
defineProps({
  solicitudes: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

// Cada estado lleva una clase para darle su color
const ESTADOS = [
  { valor: "", nombre: "Todos", clase: "admin-solicitudes__filtro--todos" },
  { valor: "PENDIENTE", nombre: "Pendiente", clase: "admin-solicitudes__filtro--pendiente" },
  { valor: "ACEPTADA", nombre: "Aceptada", clase: "admin-solicitudes__filtro--aceptada" },
  { valor: "COMPLETADA", nombre: "Completada", clase: "admin-solicitudes__filtro--completada" },
  { valor: "RECHAZADA", nombre: "Rechazada", clase: "admin-solicitudes__filtro--rechazada" },
];

// El tipo llega en minúsculas (hospitalario) y se enseña con la primera en mayúscula
function nombreTipo(tipo) {
  if (!tipo) {
    return "";
  }
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

// Clase de color de la píldora del tipo (hospitalario o domicilio)
function claseTipo(tipo) {
  if (!tipo) {
    return "";
  }
  return "admin-solicitudes__tipo--" + tipo.toLowerCase();
}

function nombreEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.nombre;
    }
  }
  return estado;
}
</script>

<template>
  <section class="admin-solicitudes" id="solicitudes">
    <div class="admin-solicitudes__cabecera">
      <h2 class="admin-solicitudes__titulo">Solicitudes</h2>
    </div>

    <div class="admin-solicitudes__filtros" role="group" aria-label="Filtrar por estado">
      <button
        v-for="opcion in ESTADOS"
        :key="opcion.valor"
        type="button"
        class="admin-solicitudes__filtro"
        :class="[opcion.clase, { 'admin-solicitudes__filtro--activo': estado === opcion.valor }]"
        :aria-pressed="estado === opcion.valor"
        @click="emit('cambiarEstado', opcion.valor)"
      >
        {{ opcion.nombre }}
      </button>
    </div>

    <p v-if="solicitudes.length === 0" class="admin-solicitudes__vacio">
      No hay solicitudes con este estado.
    </p>

    <div v-else class="admin-solicitudes__tabla">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Familia</th>
            <th>Cuidador</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in solicitudes" :key="solicitud.id">
            <td data-label="Tipo">
              <span
                class="admin-solicitudes__tipo"
                :class="claseTipo(solicitud.tipoCuidado)"
              >
                {{ nombreTipo(solicitud.tipoCuidado) }}
              </span>
            </td>
            <td data-label="Familia">{{ solicitud.nombreFamilia }}</td>
            <td data-label="Cuidador">{{ solicitud.nombreCuidador }}</td>
            <td data-label="Fecha">
              <span class="admin-solicitudes__fecha">
                {{ formatearFecha(solicitud.fechaCuidado) }}
              </span>
            </td>
            <td data-label="Estado">
              <span
                class="admin-solicitudes__pildora"
                :class="'admin-solicitudes__pildora--' + solicitud.estado.toLowerCase()"
              >
                {{ nombreEstado(solicitud.estado) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-solicitudes {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-solicitudes__cabecera {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-solicitudes__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

/* Botones de estado: Todos, Pendiente, Aceptada, Completada y Rechazada */
.admin-solicitudes__filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.admin-solicitudes__filtro {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

/* Todos: gris neutro */
.admin-solicitudes__filtro--todos:hover,
.admin-solicitudes__filtro--todos.admin-solicitudes__filtro--activo {
  background-color: var(--color-neutral-bg);
  border-color: var(--color-text-muted);
}

/* Pendiente: naranja, igual que su píldora */
.admin-solicitudes__filtro--pendiente {
  color: var(--color-accent-dark);
}

.admin-solicitudes__filtro--pendiente:hover,
.admin-solicitudes__filtro--pendiente.admin-solicitudes__filtro--activo {
  background-color: var(--color-accent-bg);
  border-color: var(--color-accent-dark);
}

/* Aceptada: verde */
.admin-solicitudes__filtro--aceptada {
  color: var(--color-secondary);
}

.admin-solicitudes__filtro--aceptada:hover,
.admin-solicitudes__filtro--aceptada.admin-solicitudes__filtro--activo {
  background-color: var(--color-secondary-bg);
  border-color: var(--color-secondary);
}

/* Completada: azul */
.admin-solicitudes__filtro--completada {
  color: var(--color-info);
}

.admin-solicitudes__filtro--completada:hover,
.admin-solicitudes__filtro--completada.admin-solicitudes__filtro--activo {
  background-color: var(--color-info-bg);
  border-color: var(--color-info);
}

/* Rechazada: gris */
.admin-solicitudes__filtro--rechazada {
  color: var(--color-text-muted);
}

.admin-solicitudes__filtro--rechazada:hover,
.admin-solicitudes__filtro--rechazada.admin-solicitudes__filtro--activo {
  background-color: var(--color-neutral-bg);
  border-color: var(--color-text-muted);
}

.admin-solicitudes__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

/* En pantallas medianas la tabla se desliza hacia los lados en vez de desbordar la página */
.admin-solicitudes__tabla {
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
  /* Las palabras no se parten: si no caben, la tabla se desliza */
  white-space: nowrap;
}

tr:last-child td {
  border-bottom: none;
}

/* Tipo: hospitalario en azul y domicilio en verde (como en el gráfico del Resumen) */
.admin-solicitudes__tipo {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.admin-solicitudes__tipo--hospitalario {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.admin-solicitudes__tipo--domicilio {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

/* Fecha en una pastilla suave y en negrita */
.admin-solicitudes__fecha {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-input);
  background-color: var(--color-neutral-bg);
  font-weight: bold;
}

/* Estado: píldora de color con un puntito delante */
.admin-solicitudes__pildora {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.admin-solicitudes__pildora::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.admin-solicitudes__pildora--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-solicitudes__pildora--aceptada {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-solicitudes__pildora--completada {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.admin-solicitudes__pildora--rechazada {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

/* En el móvil cada solicitud se ve como una tarjeta: etiqueta a la izquierda y valor a la derecha */
@media (max-width: 640px) {
  .admin-solicitudes__tabla {
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
    /* La etiqueta no se encoge ni se parte aunque el valor sea largo */
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