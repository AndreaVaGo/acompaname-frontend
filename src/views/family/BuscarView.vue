<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import FotoCuidador from "@/components/FotoCuidador.vue";
import { CUIDADOS, nombreCuidado } from "@/utils/catalogoCuidados";

const cuidadorRepository = new CuidadorRepository();
const cuidadores = ref([]);
const busqueda = ref("");
const ciudadBuscada = ref("");
const tipoBuscado = ref("todos");
const sexoBuscado = ref("todos");
const serviciosBuscados = ref([]);
const soloDisponibles = ref(false);
const soloVehiculo = ref(false);
const valoracionMinima = ref(0);
const cargando = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    cuidadores.value = await cuidadorRepository.getAll();
  } catch (err) {
    error.value = "No se pudieron cargar los cuidadores.";
  } finally {
    cargando.value = false;
  }
});

// Un cuidador sin tipo de cuidado se trata como "ambos"
function tipoDe(cuidador) {
  return cuidador.tipoCuidado || "ambos";
}

function textoTipo(cuidador) {
  const tipo = tipoDe(cuidador);
  if (tipo === "hospitalario") return "Hospitalario";
  if (tipo === "domicilio") return "A domicilio";
  return "Hospital y domicilio";
}

// Un cuidador sin servicios se trata como una lista vacía
function serviciosDe(cuidador) {
  return cuidador.servicios || [];
}

// El cuidador tiene que ofrecer TODOS los servicios que se han marcado
function tieneLosServicios(cuidador) {
  for (const codigo of serviciosBuscados.value) {
    if (!serviciosDe(cuidador).includes(codigo)) {
      return false;
    }
  }
  return true;
}

const cuidadoresFiltrados = computed(() => {
  return cuidadores.value.filter((cuidador) => {
    const coincideTexto =
      cuidador.usuarioNombre
        .toLowerCase()
        .includes(busqueda.value.toLowerCase()) ||
      cuidador.especialidad
        .toLowerCase()
        .includes(busqueda.value.toLowerCase());

    // Si el cuidador no tiene ciudad, lo tratamos como texto vacío
    const coincideCiudad = (cuidador.ciudad || "")
      .toLowerCase()
      .includes(ciudadBuscada.value.trim().toLowerCase());

    // Quien ofrece "ambos" sirve para hospitalario y para domicilio
    const coincideTipo =
      tipoBuscado.value === "todos" ||
      tipoDe(cuidador) === "ambos" ||
      tipoDe(cuidador) === tipoBuscado.value;

    // Con "todos" vale cualquiera; si no, el cuidador tiene que haber indicado ese sexo
    const coincideSexo =
      sexoBuscado.value === "todos" || cuidador.sexo === sexoBuscado.value;

    const coincideServicios = tieneLosServicios(cuidador);

    // Si el filtro no está activado, todos los cuidadores valen
    const coincideDisponible =
      !soloDisponibles.value || cuidador.disponibleAhora;
    const coincideVehiculo = !soloVehiculo.value || cuidador.tieneVehiculo;

    // Sin valoraciones, la media es null: solo vale si no se pide mínima
    const coincideValoracion =
      valoracionMinima.value === 0 ||
      (cuidador.valoracionMedia !== null &&
        cuidador.valoracionMedia >= valoracionMinima.value);

    return (
      coincideTexto &&
      coincideCiudad &&
      coincideTipo &&
      coincideSexo &&
      coincideServicios &&
      coincideDisponible &&
      coincideVehiculo &&
      coincideValoracion
    );
  });
});
</script>

<template>
  <div class="buscar">
    <header class="buscar__header">
      <h1>Cuidadores disponibles</h1>
      <p>
        Elige el tipo de cuidado que necesitas y mira quién puede acompañaros.
      </p>
    </header>

    <div class="buscar__search">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por nombre o especialidad..."
        class="buscar__input"
      />
      <button class="btn btn--primary">Buscar</button>
    </div>

    <div class="buscar__filters">
      <div class="buscar__filter-group">
        <label for="filtro-ciudad">Ciudad</label>
        <input
          type="text"
          id="filtro-ciudad"
          v-model="ciudadBuscada"
          placeholder="Oviedo, Gijón, Madrid..."
          class="buscar__input buscar__input--ciudad"
        />
      </div>

      <div class="buscar__filter-group">
        <label>Tipo de cuidado</label>
        <div class="buscar__filter-options">
          <button
            id="filtro-tipo-todos"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': tipoBuscado === 'todos' }"
            @click="tipoBuscado = 'todos'"
          >
            Todos
          </button>
          <button
            id="filtro-tipo-hospitalario"
            class="buscar__filter-btn"
            :class="{
              'buscar__filter-btn--active': tipoBuscado === 'hospitalario',
            }"
            @click="tipoBuscado = 'hospitalario'"
          >
            Hospitalario
          </button>
          <button
            id="filtro-tipo-domicilio"
            class="buscar__filter-btn"
            :class="{
              'buscar__filter-btn--active': tipoBuscado === 'domicilio',
            }"
            @click="tipoBuscado = 'domicilio'"
          >
            A domicilio
          </button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Sexo del cuidador</label>
        <div class="buscar__filter-options">
          <button
            id="filtro-sexo-todos"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': sexoBuscado === 'todos' }"
            @click="sexoBuscado = 'todos'"
          >
            Cualquiera
          </button>
          <button
            id="filtro-sexo-mujer"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': sexoBuscado === 'MUJER' }"
            @click="sexoBuscado = 'MUJER'"
          >
            Mujer
          </button>
          <button
            id="filtro-sexo-hombre"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': sexoBuscado === 'HOMBRE' }"
            @click="sexoBuscado = 'HOMBRE'"
          >
            Hombre
          </button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <p class="buscar__filter-titulo">Servicios que necesitas</p>
        <div class="buscar__servicios">
          <label
            v-for="servicio in CUIDADOS"
            :key="servicio.codigo"
            class="buscar__check"
            :class="{
              'buscar__check--marcado': serviciosBuscados.includes(
                servicio.codigo,
              ),
            }"
          >
            <input
              type="checkbox"
              :id="'filtro-servicio-' + servicio.codigo"
              :value="servicio.codigo"
              v-model="serviciosBuscados"
            />
            {{ servicio.nombre }}
          </label>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Disponibilidad</label>
        <div class="buscar__filter-options">
          <button
            id="filtro-cualquier-disponibilidad"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': !soloDisponibles }"
            @click="soloDisponibles = false"
          >
            Cualquier disponibilidad
          </button>
          <button
            id="filtro-disponible"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': soloDisponibles }"
            @click="soloDisponibles = true"
          >
            Disponible ahora
          </button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Vehículo propio</label>
        <div class="buscar__filter-options">
          <button
            id="filtro-indiferente"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': !soloVehiculo }"
            @click="soloVehiculo = false"
          >
            Indiferente
          </button>
          <button
            id="filtro-vehiculo"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': soloVehiculo }"
            @click="soloVehiculo = true"
          >
            Con vehículo propio
          </button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Valoración mínima</label>
        <div class="buscar__filter-options">
          <button
            id="filtro-valoracion-0"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': valoracionMinima === 0 }"
            @click="valoracionMinima = 0"
          >
            Cualquiera
          </button>
          <button
            id="filtro-valoracion-3"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': valoracionMinima === 3 }"
            @click="valoracionMinima = 3"
          >
            3 ⭐ o más
          </button>
          <button
            id="filtro-valoracion-4"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': valoracionMinima === 4 }"
            @click="valoracionMinima = 4"
          >
            4 ⭐ o más
          </button>
          <button
            id="filtro-valoracion-45"
            class="buscar__filter-btn"
            :class="{ 'buscar__filter-btn--active': valoracionMinima === 4.5 }"
            @click="valoracionMinima = 4.5"
          >
            4.5 ⭐ o más
          </button>
        </div>
      </div>
    </div>

    <p class="buscar__count">
      {{ cuidadoresFiltrados.length }}
      {{ cuidadoresFiltrados.length === 1 ? "cuidador" : "cuidadores" }} para ti
    </p>

    <div class="buscar__grid">
      <div
        class="buscar__card"
        :class="
          cuidador.disponibleAhora
            ? 'buscar__card--disponible'
            : 'buscar__card--ocupado'
        "
        v-for="cuidador in cuidadoresFiltrados"
        :key="cuidador.id"
      >
        <div class="buscar__card-cabecera">
          <FotoCuidador
            :foto="cuidador.foto"
            :nombre="cuidador.usuarioNombre"
            :tamano="64"
          />
          <div>
            <h3>{{ cuidador.usuarioNombre }}</h3>
            <p class="buscar__card-especialidad">{{ cuidador.especialidad }}</p>
            <p v-if="cuidador.ciudad" class="buscar__card-ciudad">
              📍 {{ cuidador.ciudad }}
            </p>
          </div>
        </div>

        <p class="buscar__card-valoracion">
          <template v-if="cuidador.valoracionMedia !== null">
            <RouterLink
              :to="{ path: `/cuidador/${cuidador.id}`, query: { valoraciones: 1 } }"
              class="buscar__card-valoracion-enlace"
            >
              <span>⭐</span>
              <span class="buscar__card-valoracion-texto"
                >{{ cuidador.valoracionMedia }} ({{ cuidador.numValoraciones }}
                {{
                  cuidador.numValoraciones === 1 ? "valoración" : "valoraciones"
                }})</span
              >
            </RouterLink>
          </template>
          <template v-else>Sin valoraciones todavía</template>
        </p>

        <div class="buscar__tags">
          <span class="buscar__tag buscar__tag--tipo">{{
            textoTipo(cuidador)
          }}</span>
          <span
            class="buscar__tag buscar__tag--disponible"
            v-if="cuidador.disponibleAhora"
            >Disponible ahora</span
          >
          <span
            class="buscar__tag buscar__tag--vehiculo"
            v-if="cuidador.tieneVehiculo"
            >Vehículo propio</span
          >
        </div>

        <div class="buscar__tags" v-if="serviciosDe(cuidador).length > 0">
          <span
            class="buscar__tag buscar__tag--servicio"
            v-for="codigo in serviciosDe(cuidador)"
            :key="codigo"
            >{{ nombreCuidado(codigo) }}</span
          >
        </div>

        <div class="buscar__card-footer">
          <span class="buscar__precio">{{ cuidador.tarifaHora }} €/hora</span>
          <RouterLink :to="`/cuidador/${cuidador.id}`" class="btn btn--primary"
            >Ver perfil</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buscar {
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.buscar__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.buscar__search {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.buscar__input {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-size: 1rem;
  font-family: inherit;
}

.buscar__input--ciudad {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
}

.buscar__filters {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.buscar__filter-group {
  margin-bottom: 16px;

  & label {
    display: block;
    font-weight: bold;
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
}

.buscar__filter-titulo {
  font-weight: bold;
  font-size: 0.85rem;
  margin: 0 0 8px;
}

.buscar__filter-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.buscar__servicios {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.buscar__filter-group .buscar__check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  font-size: 0.9rem;
  margin-bottom: 0;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background-color: var(--color-white);
  cursor: pointer;
}

.buscar__filter-group .buscar__check:hover {
  border-color: var(--color-accent);
}

.buscar__filter-group .buscar__check--marcado {
  border-color: var(--color-accent);
  background-color: var(--color-accent-bg);
}

.buscar__check input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
}

.buscar__filter-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--color-text);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
}

.buscar__filter-btn--active {
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}

.buscar__count {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.buscar__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
}

.buscar__card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border: 1px solid transparent;
  border-top: 4px solid var(--color-border);
  padding: 22px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  & h3 {
    margin: 0 0 4px;
    font-size: 1.2rem;
  }
}

/* Solo en pantallas con ratón: la tarjeta se eleva un poco */
@media (hover: hover) {
  .buscar__card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

/* La línea de arriba indica la disponibilidad: verde si está disponible, roja si no */
.buscar__card--disponible {
  border-top-color: var(--color-secondary);
}

.buscar__card--ocupado {
  border-top-color: var(--color-error);
}

.buscar__card-cabecera {
  display: flex;
  align-items: center;
  gap: 14px;
  /* La franja de color llega hasta los bordes de la tarjeta */
  margin: -22px -22px 16px;
  padding: 22px;
  background-color: var(--color-accent-bg);
}

.buscar__card-especialidad {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.buscar__card-ciudad {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: 4px 0 0;
}

.buscar__card-valoracion {
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 14px;
}

.buscar__card-valoracion-enlace {
  color: var(--color-accent);
  text-decoration: none;
}

/* Solo el texto va subrayado, la estrella no */
.buscar__card-valoracion-texto {
  text-decoration: underline;
}

.buscar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.buscar__tag {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
}

.buscar__tag--tipo {
  background-color: var(--color-neutral-bg);
  color: var(--color-text);
}

.buscar__tag--disponible {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-weight: bold;

  /* Círculo verde delante, igual que en el perfil del cuidador */
  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background-color: var(--color-secondary);
  }
}

.buscar__tag--vehiculo {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.buscar__tag--servicio {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.buscar__card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid var(--color-neutral-bg);
  padding-top: 16px;

  & .btn {
    text-decoration: none;
  }
}

.buscar__precio {
  font-size: 1.25rem;
  font-weight: bold;
}

@media (max-width: 900px) {
  .buscar {
    padding: 24px 20px;
  }

  .buscar__grid {
    grid-template-columns: 1fr;
  }

  .buscar__input--ciudad {
    max-width: none;
  }

  .buscar__filter-options {
    gap: 8px;
  }

  .buscar__filter-btn {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  .buscar__servicios {
    gap: 8px;
  }
}
</style>