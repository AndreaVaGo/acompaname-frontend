<script setup>
// Tabla de usuarios: avisa a la vista cuando se pulsa Bloquear o Desbloquear
defineProps({
  usuarios: { type: Array, required: true },
  idPropio: { type: [Number, String], default: null },
});

const emit = defineEmits(["cambiarActivo"]);

// Nombre del rol tal como se enseña en la tabla
function nombreRol(rol) {
  if (rol === "FAMILIA") {
    return "Familia";
  }
  if (rol === "CUIDADOR") {
    return "Cuidador";
  }
  if (rol === "ADMIN") {
    return "Administrador";
  }
  return rol;
}

// Clase de color de la píldora del rol
function claseRol(rol) {
  if (rol === "FAMILIA") {
    return "admin-usuarios__pildora--familia";
  }
  if (rol === "CUIDADOR") {
    return "admin-usuarios__pildora--cuidador";
  }
  return "admin-usuarios__pildora--admin";
}

// El id propio puede llegar como texto (sessionStorage) y el del usuario como número
function esMiCuenta(usuario, idPropio) {
  return String(usuario.id) === String(idPropio);
}
</script>

<template>
  <section class="admin-usuarios" id="usuarios">
    <h2 class="titulo-seccion">Usuarios</h2>

    <div class="admin-usuarios__tabla">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td data-label="Nombre">{{ usuario.nombre }}</td>
            <td data-label="Email">{{ usuario.email }}</td>
            <td data-label="Rol">
              <span class="admin-usuarios__pildora" :class="claseRol(usuario.rol)">
                {{ nombreRol(usuario.rol) }}
              </span>
            </td>
            <td data-label="Estado">
              <span
                v-if="!usuario.activo"
                class="admin-usuarios__pildora admin-usuarios__pildora--bloqueado"
              >
                Bloqueado
              </span>
              <span v-else>Activo</span>
            </td>
            <td data-label="Acción">
              <span v-if="esMiCuenta(usuario, idPropio)" class="admin-usuarios__tu">Tú</span>
              <button
                v-else
                type="button"
                class="btn btn--secondary admin-usuarios__boton"
                @click="emit('cambiarActivo', usuario)"
              >
                {{ usuario.activo ? "Bloquear" : "Desbloquear" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-usuarios {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-usuarios .titulo-seccion {
  margin-top: 0;
}

/* En pantallas medianas la tabla se desliza hacia los lados en vez de desbordar la página */
.admin-usuarios__tabla {
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

.admin-usuarios__pildora {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.admin-usuarios__pildora--familia {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-usuarios__pildora--cuidador {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-usuarios__pildora--admin {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.admin-usuarios__pildora--bloqueado {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.admin-usuarios__tu {
  color: var(--color-text-muted);
  font-style: italic;
}

.admin-usuarios__boton {
  padding: 8px 16px;
  font-size: 0.85rem;
}

/* En el móvil cada usuario se ve como una tarjeta: etiqueta a la izquierda y valor a la derecha */
@media (max-width: 640px) {
  .admin-usuarios__tabla {
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