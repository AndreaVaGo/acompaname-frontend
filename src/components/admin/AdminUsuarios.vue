<script setup>
import { ref, computed } from "vue";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";
import AdminCabeceraOrden from "@/components/admin/AdminCabeceraOrden.vue";
import AdminOrdenar from "@/components/admin/AdminOrdenar.vue";
import { ordenarFilas, siguienteOrden } from "@/utils/ordenarTabla";

// Tabla de usuarios con botones por rol (Todos, Familias, Cuidadores y Administradores, cada uno
// con su contador y con el mismo color que su píldora de rol) y buscador por nombre o email.
// Los dos los hace el propio componente sobre la lista que ya tiene. Avisa a la vista cuando
// se pulsa Bloquear o Desbloquear.
const props = defineProps({
  usuarios: { type: Array, required: true },
  idPropio: { type: [Number, String], default: null },
});

const emit = defineEmits(["cambiarActivo"]);

// Cada grupo lleva el color de su rol
const GRUPOS = [
  { valor: "", nombre: "Todos", color: "neutro" },
  { valor: "FAMILIA", nombre: "Familias", color: "verde" },
  { valor: "CUIDADOR", nombre: "Personas cuidadoras", color: "naranja" },
  { valor: "ADMIN", nombre: "Administradores", color: "azul" },
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

// Los botones del filtro, cada uno con su contador
const opcionesGrupo = computed(() => {
  return GRUPOS.map((grupo) => {
    return { valor: grupo.valor, nombre: grupo.nombre, color: grupo.color, cuenta: cuantos(grupo.valor) };
  });
});

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

// Orden de la tabla: por qué columna y en qué sentido ("" = como llegan del servidor)
const orden = ref({ clave: "", direccion: "asc" });

// Las columnas por las que se puede ordenar (la de Acción no tiene nada que ordenar)
const COLUMNAS = [
  { clave: "nombre", nombre: "Nombre" },
  { clave: "email", nombre: "Email" },
  { clave: "rol", nombre: "Rol" },
  { clave: "estado", nombre: "Estado" },
];

// Cómo sacar de un usuario el valor de cada columna (los activos van antes que los bloqueados)
const VALORES = {
  nombre: (usuario) => usuario.nombre,
  email: (usuario) => usuario.email,
  rol: (usuario) => nombreRol(usuario.rol),
  estado: (usuario) => (usuario.activo ? 0 : 1),
};

// Primero se filtra y se busca, y lo que queda se ordena
const usuariosOrdenados = computed(() => ordenarFilas(usuariosMostrados.value, VALORES, orden.value));

function cambiarOrden(clave) {
  orden.value = siguienteOrden(orden.value, clave);
}

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
    return "Persona cuidadora";
  }
  if (rol === "ADMIN") {
    return "Administrador";
  }
  return rol;
}

// Color de la píldora del rol (el mismo que el de su botón del filtro)
function colorRol(rol) {
  for (const grupo of GRUPOS) {
    if (grupo.valor === rol) {
      return grupo.color;
    }
  }
  return "gris";
}

// El id propio puede llegar como texto (sessionStorage) y el del usuario como número
function esMiCuenta(usuario, idPropio) {
  return String(usuario.id) === String(idPropio);
}
</script>

<template>
  <section class="admin-usuarios admin-panel" id="usuarios">
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

    <AdminFiltros
      :opciones="opcionesGrupo"
      :elegido="rolElegido"
      etiqueta="Filtrar por rol"
      @elegir="rolElegido = $event"
    />

    <p v-if="usuarios.length === 0" class="admin-usuarios__vacio">No hay usuarios.</p>
    <p v-else-if="usuariosMostrados.length === 0" class="admin-usuarios__vacio">
      Ningún usuario coincide con la búsqueda.
    </p>

    <template v-else>
      <AdminOrdenar :columnas="COLUMNAS" :orden="orden" @ordenar="cambiarOrden" />

      <div class="admin-tabla">
        <table>
          <thead>
            <tr>
              <AdminCabeceraOrden
                v-for="columna in COLUMNAS"
                :key="columna.clave"
                :etiqueta="columna.nombre"
                :clave="columna.clave"
                :orden="orden"
                @ordenar="cambiarOrden"
              />
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosOrdenados" :key="usuario.id">
              <td data-label="Nombre">{{ usuario.nombre }}</td>
              <td data-label="Email" class="admin-usuarios__celda-email">{{ usuario.email }}</td>
              <td data-label="Rol">
                <AdminPildora :color="colorRol(usuario.rol)">
                  {{ nombreRol(usuario.rol) }}
                </AdminPildora>
              </td>
              <td data-label="Estado">
                <AdminPildora v-if="usuario.activo" color="verde" punto>Activo</AdminPildora>
                <AdminPildora v-else color="rojo" punto>Bloqueado</AdminPildora>
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
  padding: 24px;
  /* El cristal viene de la clase global admin-panel; aquí solo el color de la sección */
  --admin-color: var(--color-info);
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
  /* Lo bastante ancho para que se lea entero lo que pone dentro */
  min-width: 300px;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
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

/* Los emails largos se parten en vez de ensanchar la tabla y esconder el botón Bloquear */
.admin-usuarios__celda-email {
  min-width: 160px;
  white-space: normal;
  overflow-wrap: anywhere;
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

/* En el móvil el buscador ocupa todo el ancho */
@media (max-width: 640px) {
  .admin-usuarios__buscador {
    min-width: 0;
    width: 100%;
  }

  /* En el móvil el email va debajo de su etiqueta para tener todo el ancho */
  .admin-usuarios__celda-email {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
    text-align: left;
  }
}
</style>