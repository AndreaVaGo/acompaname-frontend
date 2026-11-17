<script setup>
import { formatearFecha } from "@/utils/formatearFecha";
import AdminPildora from "@/components/admin/AdminPildora.vue";

// Tabla con las sugerencias que han enviado las familias y las personas cuidadoras.
// Las más recientes salen primero (el servidor ya las manda ordenadas).
defineProps({
  sugerencias: { type: Array, required: true },
});

// «1 sugerencia» o «3 sugerencias»
function textoSugerencias(cantidad) {
  if (cantidad === 1) {
    return "1 sugerencia";
  }
  return cantidad + " sugerencias";
}

// La fecha llega como 2026-11-17T22:15:30: se muestra 17-11-2026 22:15
function fechaYHora(fecha) {
  if (!fecha) {
    return "";
  }
  return formatearFecha(fecha.slice(0, 10)) + " " + fecha.slice(11, 16);
}

function nombreRol(rol) {
  if (rol === "FAMILIA") {
    return "Familia";
  }
  if (rol === "CUIDADOR") {
    return "Persona cuidadora";
  }
  return rol;
}

// Familia en verde y persona cuidadora en naranja, como en la tabla de usuarios
function colorRol(rol) {
  if (rol === "FAMILIA") {
    return "verde";
  }
  if (rol === "CUIDADOR") {
    return "naranja";
  }
  return "gris";
}
</script>

<template>
  <section class="admin-sugerencias">
    <h2 class="admin-sugerencias__titulo">Sugerencias</h2>

    <p v-if="sugerencias.length === 0" class="admin-sugerencias__vacio">
      Todavía no hay sugerencias.
    </p>

    <template v-else>
      <div class="admin-tabla">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Persona</th>
              <th>Rol</th>
              <th>Sugerencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sugerencia in sugerencias" :key="sugerencia.id">
              <td data-label="Fecha">{{ fechaYHora(sugerencia.fecha) }}</td>
              <td data-label="Persona">
                <span class="admin-sugerencias__nombre">{{ sugerencia.nombreUsuario }}</span>
                <span class="admin-sugerencias__email">{{ sugerencia.emailUsuario }}</span>
              </td>
              <td data-label="Rol">
                <AdminPildora :color="colorRol(sugerencia.rol)">
                  {{ nombreRol(sugerencia.rol) }}
                </AdminPildora>
              </td>
              <td data-label="Sugerencia" class="admin-sugerencias__texto">
                {{ sugerencia.texto }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="admin-sugerencias__pie">{{ textoSugerencias(sugerencias.length) }}</p>
    </template>
  </section>
</template>

<style scoped>
.admin-sugerencias {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-sugerencias__titulo {
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-sugerencias__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-sugerencias__pie {
  margin: 14px 0 0;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.admin-sugerencias__nombre {
  display: block;
  font-weight: bold;
}

.admin-sugerencias__email {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

/* El texto conserva los saltos de línea que escribió la persona y se parte si es largo */
.admin-sugerencias__texto {
  min-width: 220px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .admin-sugerencias__texto {
    min-width: 0;
  }
}
</style>
