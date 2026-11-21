<script setup>
import { ref, computed } from "vue";
import { formatearFecha } from "@/utils/formatearFecha";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";

// Sugerencias que han enviado las familias y las personas cuidadoras, en tarjetas.
// Las más recientes salen primero (el servidor ya las manda ordenadas).
// El filtro por rol y el buscador (por nombre, email o texto) los hace el propio componente.
const props = defineProps({
  sugerencias: { type: Array, required: true },
});

// Cada grupo lleva el color de su rol
const GRUPOS = [
  { valor: "", nombre: "Todas", color: "neutro" },
  { valor: "FAMILIA", nombre: "Familias", color: "verde" },
  { valor: "CUIDADOR", nombre: "Personas cuidadoras", color: "naranja" },
];

const rolElegido = ref("");
const busqueda = ref("");

// Cuántas sugerencias hay de cada grupo (no depende de lo que se busque)
function cuantas(valor) {
  if (valor === "") {
    return props.sugerencias.length;
  }
  let total = 0;
  for (const sugerencia of props.sugerencias) {
    if (sugerencia.rol === valor) {
      total = total + 1;
    }
  }
  return total;
}

// Los botones del filtro, cada uno con su contador
const opcionesGrupo = computed(() => {
  return GRUPOS.map((grupo) => {
    return { valor: grupo.valor, nombre: grupo.nombre, color: grupo.color, cuenta: cuantas(grupo.valor) };
  });
});

// Las sugerencias que cumplen el grupo elegido y lo escrito en el buscador (sin mirar mayúsculas)
const sugerenciasMostradas = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  const resultado = [];
  for (const sugerencia of props.sugerencias) {
    const coincideRol = rolElegido.value === "" || sugerencia.rol === rolElegido.value;
    const coincideTexto =
      texto === "" ||
      sugerencia.nombreUsuario.toLowerCase().includes(texto) ||
      sugerencia.emailUsuario.toLowerCase().includes(texto) ||
      sugerencia.texto.toLowerCase().includes(texto);
    if (coincideRol && coincideTexto) {
      resultado.push(sugerencia);
    }
  }
  return resultado;
});

// «1 sugerencia» o «3 sugerencias»
function textoSugerencias(cantidad) {
  if (cantidad === 1) {
    return "1 sugerencia";
  }
  return cantidad + " sugerencias";
}

// La fecha llega como 2026-11-17T22:15:30: se muestra 17-11-2026 · 22:15
function fechaYHora(fecha) {
  if (!fecha) {
    return "";
  }
  return formatearFecha(fecha.slice(0, 10)) + " · " + fecha.slice(11, 16);
}

// Letra del círculo de la tarjeta: la primera del nombre, en mayúscula
function inicial(nombre) {
  if (!nombre) {
    return "?";
  }
  return nombre.charAt(0).toUpperCase();
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
  <section class="admin-sugerencias admin-panel">
    <div class="admin-sugerencias__cabecera">
      <div>
        <h2 class="admin-sugerencias__titulo">
          <span class="admin-sugerencias__bombilla" aria-hidden="true">💡</span>
          Sugerencias
        </h2>
        <p class="admin-sugerencias__subtitulo">
          Lo que las familias y las personas cuidadoras cambiarían de Acompáñame.
        </p>
      </div>

      <input
        v-model="busqueda"
        type="search"
        class="admin-sugerencias__buscador"
        placeholder="Buscar por nombre, email o texto"
        aria-label="Buscar por nombre, email o texto"
      />
    </div>

    <AdminFiltros
      :opciones="opcionesGrupo"
      :elegido="rolElegido"
      etiqueta="Filtrar por rol"
      @elegir="rolElegido = $event"
    />

    <p v-if="sugerencias.length === 0" class="admin-sugerencias__vacio">
      Todavía no hay sugerencias. Cuando alguien envíe una, aparecerá aquí.
    </p>
    <p v-else-if="sugerenciasMostradas.length === 0" class="admin-sugerencias__vacio">
      Ninguna sugerencia coincide con la búsqueda.
    </p>

    <template v-else>
      <ul class="admin-sugerencias__lista">
        <li
          v-for="sugerencia in sugerenciasMostradas"
          :key="sugerencia.id"
          class="admin-sugerencias__tarjeta"
          :class="'admin-sugerencias__tarjeta--' + colorRol(sugerencia.rol)"
        >
          <div class="admin-sugerencias__autor">
            <span class="admin-sugerencias__avatar" aria-hidden="true">
              {{ inicial(sugerencia.nombreUsuario) }}
            </span>
            <div class="admin-sugerencias__datos">
              <span class="admin-sugerencias__nombre">{{ sugerencia.nombreUsuario }}</span>
              <span class="admin-sugerencias__email">{{ sugerencia.emailUsuario }}</span>
            </div>
            <AdminPildora :color="colorRol(sugerencia.rol)">
              {{ nombreRol(sugerencia.rol) }}
            </AdminPildora>
          </div>

          <p class="admin-sugerencias__texto">{{ sugerencia.texto }}</p>

          <p class="admin-sugerencias__fecha">{{ fechaYHora(sugerencia.fecha) }}</p>
        </li>
      </ul>

      <p class="admin-sugerencias__pie">{{ textoSugerencias(sugerenciasMostradas.length) }}</p>
    </template>
  </section>
</template>

<style scoped>
.admin-sugerencias {
  padding: 24px;
  /* El cristal viene de la clase global admin-panel; aquí solo el color de la sección */
  --admin-color: var(--color-accent);
}

.admin-sugerencias__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-sugerencias__titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-accent-dark);
}

.admin-sugerencias__bombilla {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--color-accent-bg);
  font-size: 1.2rem;
}

.admin-sugerencias__subtitulo {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.admin-sugerencias__buscador {
  /* Lo bastante ancho para que se lea entero lo que pone dentro */
  min-width: 320px;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}

.admin-sugerencias__vacio {
  margin: 16px 0 0;
  color: var(--color-text-muted);
}

/* Las tarjetas se reparten en columnas según el ancho disponible */
.admin-sugerencias__lista {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--gap-md);
}

.admin-sugerencias__tarjeta {
  --acento: var(--color-text-muted);
  --acento-fondo: var(--color-neutral-bg);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-top: 5px solid var(--acento);
  /* Cristal claro: deja ver el fondo animado de detrás */
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.2s;
}

.admin-sugerencias__tarjeta:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.admin-sugerencias__tarjeta--verde {
  --acento: var(--color-secondary);
  --acento-fondo: var(--color-secondary-bg);
}

.admin-sugerencias__tarjeta--naranja {
  --acento: var(--color-accent);
  --acento-fondo: var(--color-accent-bg);
}

.admin-sugerencias__autor {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-sugerencias__avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: var(--acento-fondo);
  color: var(--color-text);
  font-weight: bold;
  font-size: 1.1rem;
}

.admin-sugerencias__datos {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-sugerencias__nombre {
  font-weight: bold;
  overflow-wrap: anywhere;
}

.admin-sugerencias__email {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

/* El texto va en un globo, con una comilla grande de adorno; conserva los saltos de línea */
.admin-sugerencias__texto {
  position: relative;
  margin: 0;
  padding: 16px 16px 14px 40px;
  border-radius: var(--radius-input);
  background-color: var(--acento-fondo);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.5;
  flex: 1;
}

.admin-sugerencias__texto::before {
  content: "“";
  position: absolute;
  left: 12px;
  top: 2px;
  font-size: 2.6rem;
  line-height: 1;
  font-family: Georgia, serif;
  color: var(--acento);
}

.admin-sugerencias__fecha {
  margin: 0;
  align-self: flex-end;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.admin-sugerencias__pie {
  margin: 16px 0 0;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .admin-sugerencias {
    padding: 16px;
  }

  .admin-sugerencias__buscador {
    min-width: 0;
    width: 100%;
  }

  .admin-sugerencias__lista {
    grid-template-columns: 1fr;
  }
}
</style>
