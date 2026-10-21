<script setup>
import { formatearFecha } from "@/utils/formatearFecha";

// Tabla de solicitudes con el filtro por estado.
// estado es lo que está elegido en el filtro ("" = todas).
defineProps({
  solicitudes: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

const ESTADOS = [
  { valor: "", nombre: "Todos" },
  { valor: "PENDIENTE", nombre: "Pendiente" },
  { valor: "ACEPTADA", nombre: "Aceptada" },
  { valor: "COMPLETADA", nombre: "Completada" },
  { valor: "RECHAZADA", nombre: "Rechazada" },
];

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
</script>

<template>
  <section class="admin-solicitudes" id="solicitudes">
    <div class="admin-solicitudes__cabecera">
      <h2 class="admin-solicitudes__titulo">Solicitudes</h2>
      <label class="admin-solicitudes__filtro">
        <span>Estado</span>
        <select
          :value="estado"
          @change="emit('cambiarEstado', $event.target.value)"
        >
          <option v-for="opcion in ESTADOS" :key="opcion.valor" :value="opcion.valor">
            {{ opcion.nombre }}
          </option>
        </select>
      </label>
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
            <td>{{ nombreTipo(solicitud.tipoCuidado) }}</td>
            <td>{{ solicitud.nombreFamilia }}</td>
            <td>{{ solicitud.nombreCuidador }}</td>
            <td>{{ formatearFecha(solicitud.fechaCuidado) }}</td>
            <td>
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-solicitudes__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-solicitudes__filtro {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: bold;
}

.admin-solicitudes__filtro select {
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}

.admin-solicitudes__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

/* En el móvil la tabla se desliza hacia los lados en vez de desbordar la página */
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

.admin-solicitudes__pildora {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
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
</style>