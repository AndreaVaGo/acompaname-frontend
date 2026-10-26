<script setup>
import { ref, computed } from "vue";

// Tabla de usuarios con botones por rol (Todos, Familias, Cuidadores y Administradores, cada uno
// con su contador y con el mismo color que su píldora de rol) y buscador por nombre o email.
// Los dos los hace el propio componente sobre la lista que ya tiene. Avisa a la vista cuando
// se pulsa Bloquear o Desbloquear.
const props = defineProps({
  usuarios: { type: Array, required: true },
  idPropio: { type: [Number, String], default: null },
});

const emit = defineEmits(["cambiarActivo"]);

// Cada grupo lleva una clase para darle el color de su rol
const GRUPOS = [
  { valor: "", nombre: "Todos", clase: "admin-usuarios__grupo--todos" },
  { valor: "FAMILIA", nombre: "Familias", clase: "admin-usuarios__grupo--familia" },
  { valor: "CUIDADOR", nombre: "Cuidadores", clase: "admin-usuarios__grupo--cuidador" },
  { valor: "ADMIN", nombre: "Administradores", clase: "admin-usuarios__grupo--admin" },
];

// El grupo que está elegido ("" = todos) y lo que se ha escrito en el buscador
const rolElegido = ref("");
const busqueda = ref("");

// Cuántos usuarios hay en cada grupo (no depende de lo que se busque)
function cuantos(valor) {
  if (valor === "") {
    return props.usuarios.length;
  }
  let total = 0;
  for (const usuario of props.usuarios) {
    if (usuario.rol === valor) {
      total = total + 1;
    }
  }
  return total;
}

function elegirGrupo(valor) {
  rolElegido.value = valor;
}

// Los usuarios que cumplen el grupo elegido y lo escrito en el buscador (sin mirar mayúsculas)
const usuariosMostrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  const resultado = [];
  for (const usuario of props.usuarios) {
    const coincideRol = rolElegido.value === "" || usuario.rol === rolElegido.value;
    const coincideTexto =
      texto === "" ||
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.email.toLowerCase().includes(texto);
    if (coincideRol && coincideTexto) {
      resultado.push(usuario);
    }
  }
  return resultado;
});

// «1 usuario» o «3 usuarios»
function textoUsuarios(cantidad) {
  if (cantidad === 1) {
    return "1 usuario";
  }
  return cantidad + " usuarios";
}

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
    <div class="admin-usuarios__cabecera">
      <h2 class="admin-usuarios__titulo">Usuarios</h2>

      <input
        v-model="busqueda"
        type="search"
        class="admin-usuarios__buscador"
        placeholder="Buscar por nombre o email"
        aria-label="Buscar por nombre o email"
      />
    </div>

    <div class="admin-usuarios__grupos" role="group" aria-label="Filtrar por rol">
      <button
        v-for="grupo in GRUPOS"
        :key="grupo.valor"
        type="button"
        class="admin-usuarios__grupo"
        :class="[grupo.clase, { 'admin-usuarios__grupo--activo': rolElegido === grupo.valor }]"
        :aria-pressed="rolElegido === grupo.valor"
        @click="elegirGrupo(grupo.valor)"
      >
        {{ grupo.nombre }}
        <span class="admin-usuarios__cuenta">{{ cuantos(grupo.valor) }}</span>
      </button>
    </div>

    <p v-if="usuarios.length === 0" class="admin-usuarios__vacio">No hay usuarios.</p>
    <p v-else-if="usuariosMostrados.length === 0" class="admin-usuarios__vacio">
      Ningún usuario coincide con la búsqueda.
    </p>

    <template v-else>
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
            <tr v-for="usuario in usuariosMostrados" :key="usuario.id">
              <td data-label="Nombre">{{ usuario.nombre }}</td>
              <td data-label="Email">{{ usuario.email }}</td>
              <td data-label="Rol">
                <span class="admin-usuarios__pildora" :class="claseRol(usuario.rol)">
                  {{ nombreRol(usuario.rol) }}
                </span>
              </td>
              <td data-label="Estado">
                <span
                  v-if="usuario.activo"
                  class="admin-usuarios__pildora admin-usuarios__pildora--activo"
                >
                  Activo
                </span>
                <span
                  v-else
                  class="admin-usuarios__pildora admin-usuarios__pildora--bloqueado"
                >
                  Bloqueado
                </span>
              </td>
              <td data-label="Acción">
                <span v-if="esMiCuenta(usuario, idPropio)" class="admin-usuarios__tu">Tú</span>
                <button
                  v-else
                  type="button"
                  class="btn admin-usuarios__boton"
                  :class="
                    usuario.activo
                      ? 'admin-usuarios__boton--bloquear'
                      : 'admin-usuarios__boton--desbloquear'
                  "
                  @click="emit('cambiarActivo', usuario)"
                >
                  {{ usuario.activo ? "Bloquear" : "Desbloquear" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="admin-usuarios__pie">{{ textoUsuarios(usuariosMostrados.length) }}</p>
    </template>
  </section>
</template>

<style scoped>
.admin-usuarios {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-usuarios__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-usuarios__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-usuarios__buscador {
  min-width: 240px;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}

/* Botones de grupo: Todos, Familias, Cuidadores y Administradores */
.admin-usuarios__grupos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.admin-usuarios__grupo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.admin-usuarios__cuenta {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  text-align: center;
}

/* Todos: gris neutro */
.admin-usuarios__grupo--todos .admin-usuarios__cuenta {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.admin-usuarios__grupo--todos:hover {
  background-color: var(--color-neutral-bg);
}

.admin-usuarios__grupo--todos.admin-usuarios__grupo--activo {
  background-color: var(--color-neutral-bg);
  border-color: var(--color-text-muted);
}

.admin-usuarios__grupo--todos.admin-usuarios__grupo--activo .admin-usuarios__cuenta {
  background-color: var(--color-text-muted);
  color: var(--color-white);
}

/* Familias: letra y color en verde, igual que la píldora de rol */
.admin-usuarios__grupo--familia {
  color: var(--color-secondary);
}

.admin-usuarios__grupo--familia .admin-usuarios__cuenta {
  background-color: var(--color-secondary-bg);
}

.admin-usuarios__grupo--familia:hover {
  background-color: var(--color-secondary-bg);
}

.admin-usuarios__grupo--familia.admin-usuarios__grupo--activo {
  background-color: var(--color-secondary-bg);
  border-color: var(--color-secondary);
}

.admin-usuarios__grupo--familia.admin-usuarios__grupo--activo .admin-usuarios__cuenta {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

/* Cuidadores: letra y color en naranja, igual que la píldora de rol */
.admin-usuarios__grupo--cuidador {
  color: var(--color-accent-dark);
}

.admin-usuarios__grupo--cuidador .admin-usuarios__cuenta {
  background-color: var(--color-accent-bg);
}

.admin-usuarios__grupo--cuidador:hover {
  background-color: var(--color-accent-bg);
}

.admin-usuarios__grupo--cuidador.admin-usuarios__grupo--activo {
  background-color: var(--color-accent-bg);
  border-color: var(--color-accent-dark);
}

.admin-usuarios__grupo--cuidador.admin-usuarios__grupo--activo .admin-usuarios__cuenta {
  background-color: var(--color-accent-dark);
  color: var(--color-white);
}

/* Administradores: letra y color en azul, igual que la píldora de rol */
.admin-usuarios__grupo--admin {
  color: var(--color-info);
}

.admin-usuarios__grupo--admin .admin-usuarios__cuenta {
  background-color: var(--color-info-bg);
}

.admin-usuarios__grupo--admin:hover {
  background-color: var(--color-info-bg);
}

.admin-usuarios__grupo--admin.admin-usuarios__grupo--activo {
  background-color: var(--color-info-bg);
  border-color: var(--color-info);
}

.admin-usuarios__grupo--admin.admin-usuarios__grupo--activo .admin-usuarios__cuenta {
  background-color: var(--color-info);
  color: var(--color-white);
}

.admin-usuarios__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-usuarios__pie {
  margin: 14px 0 0;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-muted);
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

/* Activo (verde) y Bloqueado (rojo) llevan un puntito delante */
.admin-usuarios__pildora--activo,
.admin-usuarios__pildora--bloqueado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.admin-usuarios__pildora--activo::before,
.admin-usuarios__pildora--bloqueado::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.admin-usuarios__pildora--activo {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-usuarios__pildora--bloqueado {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

.admin-usuarios__tu {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Bloquear en rojo suave y Desbloquear en verde */
.admin-usuarios__boton {
  padding: 8px 16px;
  font-size: 0.85rem;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
}

.admin-usuarios__boton--bloquear {
  color: var(--color-error);
  border-color: var(--color-error-border);
}

.admin-usuarios__boton--bloquear:hover {
  background-color: var(--color-error-bg);
}

.admin-usuarios__boton--desbloquear {
  color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.admin-usuarios__boton--desbloquear:hover {
  background-color: var(--color-secondary-bg);
}

/* En el móvil cada usuario se ve como una tarjeta: etiqueta a la izquierda y valor a la derecha */
@media (max-width: 640px) {
  .admin-usuarios__buscador {
    min-width: 0;
    width: 100%;
  }

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