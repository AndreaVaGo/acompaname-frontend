<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import FotoCuidador from "@/components/FotoCuidador.vue";
import SelectorGrupos from "@/components/SelectorGrupos.vue";
import { CUIDADOS, nombreCuidado } from "@/utils/catalogoCuidados";
import { nombreGrupo } from "@/utils/catalogoGrupos";
import { nombreCortoTitulacion } from "@/utils/catalogoTitulaciones";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { moverFoco } from "@/utils/focoTarjeta";

const cuidadorRepository = new CuidadorRepository();
const solicitudRepository = new SolicitudRepository();
const cuidadores = ref([]);
const busqueda = ref("");
const ciudadBuscada = ref("");
const tipoBuscado = ref("todos");
const sexoBuscado = ref("todos");
const serviciosBuscados = ref([]);
// Código del grupo de edad elegido ("" = cualquier edad)
const grupoBuscado = ref("");
const soloDisponibles = ref(false);
const soloVehiculo = ref(false);
const valoracionMinima = ref(0);
const fechaDesde = ref("");
const fechaHasta = ref("");
// Horas opcionales (HH:mm): sin ellas se busca el día completo
const horaDesde = ref("");
const horaHasta = ref("");
const idsOcupados = ref([]);
const errorFechas = ref("");
const cargando = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    cuidadores.value = await cuidadorRepository.getAll();
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudieron cargar las personas cuidadoras.");
  } finally {
    cargando.value = false;
  }
});

// Cada vez que cambia una fecha o una hora se vuelve a preguntar al servidor
// qué cuidadores tienen un servicio aceptado en esos días y horas
async function comprobarFechas() {
  errorFechas.value = "";
  idsOcupados.value = [];

  // Sin fecha de inicio no hay nada que comprobar
  if (!fechaDesde.value) {
    return;
  }

  // Las fechas vienen como "2026-11-01", así que se pueden comparar como texto
  if (fechaHasta.value && fechaHasta.value < fechaDesde.value) {
    errorFechas.value = "La fecha de fin no puede ser anterior a la de inicio";
    return;
  }

  // Si se busca un solo día y se dan las dos horas, la de fin tiene que ser posterior
  // (las horas tienen formato HH:mm, así que también se pueden comparar como texto)
  const unSoloDia = !fechaHasta.value || fechaHasta.value === fechaDesde.value;
  if (unSoloDia && horaDesde.value && horaHasta.value && horaHasta.value <= horaDesde.value) {
    errorFechas.value = "La hora de fin tiene que ser posterior a la de inicio";
    return;
  }

  try {
    idsOcupados.value = await solicitudRepository.getCuidadoresOcupados(
      fechaDesde.value,
      fechaHasta.value,
      horaDesde.value,
      horaHasta.value,
    );
  } catch (err) {
    errorFechas.value = mensajeDeError(err, "No se pudo comprobar la disponibilidad por fechas.");
  }
}

watch([fechaDesde, fechaHasta, horaDesde, horaHasta], comprobarFechas);

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

// Una persona cuidadora sin titulaciones indicadas se trata como una lista vacía
function titulacionesDe(cuidador) {
  return cuidador.titulaciones || [];
}

// Una persona cuidadora sin grupos de edad indicados se trata como una lista vacía
function gruposDe(cuidador) {
  return cuidador.gruposEdad || [];
}

// Con un grupo elegido, la persona cuidadora tiene que haberlo marcado en su perfil
// (quien no ha indicado ningún grupo no sale, porque no sabemos a quién cuida)
function cuidaAlGrupo(cuidador) {
  return grupoBuscado.value === "" || gruposDe(cuidador).includes(grupoBuscado.value);
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

    const coincideGrupo = cuidaAlGrupo(cuidador);

    // Si el filtro no está activado, todos los cuidadores valen
    const coincideDisponible =
      !soloDisponibles.value || cuidador.disponibleAhora;
    const coincideVehiculo = !soloVehiculo.value || cuidador.tieneVehiculo;

    // Sin valoraciones, la media es null: solo vale si no se pide mínima
    const coincideValoracion =
      valoracionMinima.value === 0 ||
      (cuidador.valoracionMedia !== null &&
        cuidador.valoracionMedia >= valoracionMinima.value);

    // Se quita a quien ya tiene un servicio aceptado en las fechas elegidas
    const coincideFechas = !idsOcupados.value.includes(cuidador.id);

    return (
      coincideTexto &&
      coincideCiudad &&
      coincideTipo &&
      coincideSexo &&
      coincideServicios &&
      coincideGrupo &&
      coincideDisponible &&
      coincideVehiculo &&
      coincideValoracion &&
      coincideFechas
    );
  });
});
</script>

<template>
  <div class="buscar">
    <header class="buscar__header">
      <h1>Personas cuidadoras disponibles</h1>
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
      <!-- La edad de la persona que necesita cuidados es lo primero que se elige -->
      <div class="buscar__filter-group buscar__filter-group--ancho buscar__filter-group--primero">
        <SelectorGrupos
          v-model="grupoBuscado"
          legend="Edad de la persona que necesita cuidados"
          texto-todos="Cualquier edad"
          name="filtro-grupo"
        />
      </div>

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
        <p class="buscar__filter-titulo">Fechas del servicio</p>
        <div class="buscar__fechas">
          <div class="buscar__fecha">
            <label for="filtro-fecha-desde">Desde</label>
            <input
              type="date"
              id="filtro-fecha-desde"
              v-model="fechaDesde"
              class="buscar__input buscar__input--fecha"
            />
          </div>
          <div class="buscar__fecha">
            <label for="filtro-fecha-hasta">Hasta</label>
            <input
              type="date"
              id="filtro-fecha-hasta"
              v-model="fechaHasta"
              class="buscar__input buscar__input--fecha"
            />
          </div>
        </div>
        <div class="buscar__fechas">
          <div class="buscar__fecha">
            <label for="filtro-hora-desde">Desde las (opcional)</label>
            <input
              type="time"
              id="filtro-hora-desde"
              v-model="horaDesde"
              class="buscar__input buscar__input--fecha"
            />
          </div>
          <div class="buscar__fecha">
            <label for="filtro-hora-hasta">Hasta las (opcional)</label>
            <input
              type="time"
              id="filtro-hora-hasta"
              v-model="horaHasta"
              class="buscar__input buscar__input--fecha"
            />
          </div>
        </div>
        <p role="alert" v-if="errorFechas" class="buscar__error">{{ errorFechas }}</p>
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
        <label>Sexo de la persona cuidadora</label>
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

      <!-- Los servicios van al final, en un bloque propio de ancho completo -->
      <div class="buscar__filter-group buscar__filter-group--ancho">
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
    </div>

    <p role="alert" v-if="error" class="buscar__error">{{ error }}</p>

    <p class="buscar__count">
      {{ cuidadoresFiltrados.length }}
      {{ cuidadoresFiltrados.length === 1 ? "persona cuidadora" : "personas cuidadoras" }} para ti
    </p>

    <div class="buscar__grid">
      <div
        class="buscar__card"
        :class="
          cuidador.disponibleAhora
            ? 'buscar__card--disponible'
            : 'buscar__card--ocupado'
        "
        v-for="(cuidador, indice) in cuidadoresFiltrados"
        :key="cuidador.id"
        :style="{ '--i': Math.min(indice, 8) }"
        @mousemove="moverFoco"
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

        <!-- Valoración y etiquetas: en pantallas anchas ocupan el centro de la fila -->
        <div class="buscar__card-centro">
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

        <div class="buscar__tags" v-if="gruposDe(cuidador).length > 0">
          <span
            class="buscar__tag buscar__tag--grupo"
            v-for="codigo in gruposDe(cuidador)"
            :key="codigo"
            >{{ nombreGrupo(codigo) }}</span
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

        <div class="buscar__tags" v-if="titulacionesDe(cuidador).length > 0">
          <span
            class="buscar__tag buscar__tag--titulacion"
            v-for="codigo in titulacionesDe(cuidador)"
            :key="codigo"
            >{{ nombreCortoTitulacion(codigo) }}</span
          >
        </div>

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
  /* El fondo lo pone el body; las manchas de color van detrás, con isolation */
  isolation: isolate;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Fondo vivo: un degradado de verde, coral y amarillo suave que se desplaza despacio detrás de la página.
   Va fijo en la pantalla, así se sigue viendo al hacer scroll */
.buscar::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 15% 20%, rgba(150, 215, 175, 0.75), transparent 45%),
    radial-gradient(circle at 85% 25%, rgba(250, 175, 150, 0.6), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(253, 226, 160, 0.65), transparent 50%);
  background-size: 160% 160%;
  animation: buscar-degradado 18s ease-in-out infinite alternate;
}

/* Una mancha grande extra que cruza la pantalla para dar profundidad */
.buscar::after {
  content: "";
  position: fixed;
  top: 30%;
  left: -10%;
  z-index: -1;
  pointer-events: none;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(60px);
  background: radial-gradient(circle, rgba(120, 200, 160, 0.55), transparent 70%);
  animation: buscar-mancha 24s ease-in-out infinite alternate;
}

@keyframes buscar-degradado {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 100% 100%;
  }
}

@keyframes buscar-mancha {
  to {
    translate: 120vw -20vh;
    scale: 1.3;
  }
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

  & .btn {
    padding: 12px 32px;
  }
}

.buscar__input {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-size: 1rem;
  font-family: inherit;
}

.buscar__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-bg);
}

/* El buscador principal es redondeado y lleva sombra */
.buscar__search .buscar__input {
  border-radius: var(--radius-pill);
  padding: 14px 22px;
  box-shadow: var(--shadow-card);
}

.buscar__input--ciudad {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
}

/* Las dos fechas (y las dos horas) van una al lado de la otra */
.buscar__fechas {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.buscar__fechas + .buscar__fechas {
  margin-top: 12px;
}

.buscar__fecha {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.buscar__input--fecha {
  flex: none;
  padding: 8px 12px;
}

/* Avisos de error: en rojo, como los demás errores */
.buscar__error {
  color: var(--color-error);
  font-size: 0.9rem;
  margin: 8px 0 0;
}

/* Los filtros van por parejas en dos columnas */
.buscar__filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px 40px;
  /* Cristal: blanco translúcido con desenfoque, para que se vea el fondo moverse detrás */
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

/* Los servicios ocupan una fila entera, separada del resto por una línea */
.buscar__filter-group--ancho {
  grid-column: 1 / -1;
  border-top: 1px solid var(--color-neutral-bg);
  padding-top: 22px;
}

/* El filtro de edad va arriba, sin línea de separación */
.buscar__filter-group--primero {
  border-top: none;
  padding-top: 0;
}

.buscar__filter-group {
  /* Títulos de cada filtro: pequeños, en mayúsculas y en gris */
  & > label {
    display: block;
    font-weight: bold;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    margin-bottom: 10px;
  }
}

.buscar__filter-titulo {
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin: 0 0 10px;
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

/* Solo en pantallas con ratón: el botón se tiñe un poco al pasar por encima */
@media (hover: hover) {
  .buscar__filter-btn:hover {
    border-color: var(--color-accent);
    background-color: var(--color-accent-bg);
  }
}

/* El filtro activo va en coral suave; el coral sólido se queda para el botón Buscar */
.buscar__filter-btn--active {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
  border-color: var(--color-accent);
  font-weight: bold;
}

.buscar__count {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 16px;
}

/* Una tarjeta por fila: así caben todas las etiquetas sin apretarse */
.buscar__grid {
  display: grid;
  grid-template-columns: 1fr;
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
  position: relative;
  /* Entrada escalonada: cada tarjeta aparece un poco después de la anterior */
  animation: buscar-entra 0.5s var(--ease-out) backwards;
  animation-delay: calc(var(--i, 0) * 60ms);
  transition:
    transform var(--dur-med) var(--ease-out),
    box-shadow var(--dur-med) var(--ease-out);

  & h3 {
    margin: 0 0 4px;
    font-size: 1.2rem;
  }
}

/* Solo en pantallas con ratón: la tarjeta se eleva un poco */
@media (hover: hover) {
  .buscar__card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }
}

@keyframes buscar-entra {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

/* Resplandor verde suave que sigue al ratón dentro de la tarjeta */
.buscar__card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    240px circle at var(--x, 50%) var(--y, 50%),
    rgba(46, 125, 91, 0.12),
    transparent 70%
  );
  transition: opacity var(--dur-med) var(--ease-out);
}

@media (hover: hover) {
  .buscar__card:hover::after {
    opacity: 1;
  }
}

/* Cuidadores alternos: la franja de las tarjetas pares va en verde suave */
.buscar__card:nth-child(even) .buscar__card-cabecera {
  background-color: var(--color-secondary-bg);
}

@media (prefers-reduced-motion: reduce) {
  .buscar::before,
  .buscar::after {
    animation: none;
  }

  .buscar__card {
    animation: none;
    transition: none;
  }

  .buscar__card:hover {
    transform: none;
  }

  .buscar__card::after {
    transition: none;
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

/* La ciudad va en negrita y con el color de texto normal para que se lea bien */
.buscar__card-ciudad {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: bold;
  margin: 4px 0 0;
}

.buscar__card-valoracion {
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 14px;
}

.buscar__card-valoracion-enlace {
  color: var(--color-accent-dark);
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

.buscar__tag--titulacion {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.buscar__tag--grupo {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
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

/* Pantallas anchas: la tarjeta se alarga en tres columnas (persona · detalles · precio y botón) */
@media (min-width: 901px) {
  .buscar__card {
    display: grid;
    grid-template-columns: 300px 1fr 200px;
    align-items: stretch;
    padding: 0;
    border-top: 1px solid transparent;
    border-left: 6px solid var(--color-border);
  }

  .buscar__card--disponible {
    border-top-color: transparent;
    border-left-color: var(--color-secondary);
  }

  .buscar__card--ocupado {
    border-top-color: transparent;
    border-left-color: var(--color-error);
  }

  /* La franja de color pasa a ser la columna de la izquierda, a toda la altura */
  .buscar__card-cabecera {
    margin: 0;
    padding: 24px;
  }

  .buscar__card-centro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 24px;
  }

  .buscar__card-footer {
    flex-direction: column;
    justify-content: center;
    gap: 14px;
    margin-top: 0;
    padding: 20px 24px;
    border-top: none;
    border-left: 1px solid var(--color-neutral-bg);
  }
}

@media (max-width: 900px) {
  .buscar {
    padding: 24px 20px;
  }

  .buscar__grid {
    grid-template-columns: 1fr;
  }

  .buscar__filters {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .buscar__filter-group--ancho {
    grid-column: auto;
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