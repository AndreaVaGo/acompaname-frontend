<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import SelectorGrupos from "@/components/SelectorGrupos.vue";
import { CUIDADOS } from "@/utils/catalogoCuidados";
import { GRUPOS, buscarGrupo, edadValidaParaGrupo } from "@/utils/catalogoGrupos";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { formatearEuros } from "@/utils/formatearEuros";
import { horasDeCuidado, estimarImporte } from "@/utils/estimacionImporte";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const solicitudRepository = new SolicitudRepository();
const cuidadorRepository = new CuidadorRepository();

const cuidadorId = route.params.id;
const cuidadorNombre = ref("");
// Tarifa por hora de la persona cuidadora, para calcular el precio estimado
const tarifaHora = ref(0);
// Recargo por persona extra de esta persona cuidadora, en porcentaje (null = el de por defecto)
const recargoPersonaExtra = ref(null);

// Código del grupo de edad de la persona cuidada (es lo primero que se elige)
const grupoEdad = ref("");
const tipoCuidado = ref("");
const direccion = ref("");
const hospital = ref("");
const ubicacionHospital = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");
// Horas en formato HH:mm. La de inicio cuenta el primer día y la de fin el último
const horaInicio = ref("");
const horaFin = ref("");
// Personas que van a recibir el cuidado: como mínimo una y como máximo cinco
const MAX_PERSONAS = 5;
const personas = ref([{ nombre: "", edad: "" }]);
const necesidades = ref([]);
const notas = ref("");
const error = ref("");

// Precio estimado: horas x tarifa, con recargo por cada persona extra.
// Es null mientras falten datos (fechas, horas o tarifa)
const estimacion = computed(() => {
  const horas = horasDeCuidado(
    fechaInicio.value,
    horaInicio.value,
    fechaFin.value,
    horaFin.value,
  );
  return estimarImporte(
    tarifaHora.value,
    horas,
    personas.value.length,
    recargoPersonaExtra.value,
  );
});

// El grupo elegido trae los textos de ejemplo y los límites de edad (todo está en catalogoGrupos)
const grupo = computed(() => buscarGrupo(grupoEdad.value));

onMounted(async () => {
  try {
    const cuidador = await cuidadorRepository.getById(cuidadorId);
    cuidadorNombre.value = cuidador.usuarioNombre;
    tarifaHora.value = cuidador.tarifaHora;
    recargoPersonaExtra.value = cuidador.recargoPersonaExtra ?? null;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar a la persona cuidadora.");
  }
});

// Para un hospital se guarda "Hospital, planta/área/habitación" en un solo texto
function direccionCompleta() {
  if (tipoCuidado.value === "hospitalario") {
    return hospital.value.trim() + ", " + ubicacionHospital.value.trim();
  }
  return direccion.value.trim();
}

function faltaDireccion() {
  if (tipoCuidado.value === "hospitalario") {
    return !hospital.value.trim() || !ubicacionHospital.value.trim();
  }
  return !direccion.value.trim();
}

// Código del grupo de edad de una persona. La primera usa el que se elige arriba;
// las demás tienen el suyo, así se puede pedir "tres niños y un abuelo" en la misma solicitud
function codigoDeGrupo(indice) {
  if (indice === 0) {
    return grupoEdad.value;
  }
  return personas.value[indice].grupoEdad;
}

// Datos del grupo de una persona (límites de edad y textos de ejemplo)
function grupoDePersona(indice) {
  return buscarGrupo(codigoDeGrupo(indice)) || grupo.value;
}

// Cambia el grupo de una persona. El de la primera es el mismo que se elige arriba,
// así que los dos selectores siempre enseñan lo mismo
function cambiarGrupo(indice, codigo) {
  if (indice === 0) {
    grupoEdad.value = codigo;
  } else {
    personas.value[indice].grupoEdad = codigo;
  }
}

function anadirPersona() {
  if (personas.value.length < MAX_PERSONAS) {
    // La persona nueva empieza con el mismo grupo que la primera, y se puede cambiar
    personas.value.push({ nombre: "", edad: "", grupoEdad: grupoEdad.value });
  }
}

// La primera persona no se puede quitar: siempre hay al menos una
function quitarPersona(indice) {
  if (indice > 0) {
    personas.value.splice(indice, 1);
  }
}

// La edad 0 es válida (un bebé), así que no se puede comprobar con "!edad"
function faltaEdad(persona) {
  return persona.edad === "" || persona.edad === null;
}

// Alguna persona sin nombre, sin edad o sin grupo de edad
function faltanDatosDePersonas() {
  for (let i = 0; i < personas.value.length; i++) {
    const persona = personas.value[i];
    if (!persona.nombre.trim() || faltaEdad(persona) || !codigoDeGrupo(i)) {
      return true;
    }
  }
  return false;
}

// Devuelve el texto de error de la primera persona cuya edad no encaja con SU grupo,
// o un texto vacío si todas encajan
function errorDeEdadPorGrupo() {
  for (let i = 0; i < personas.value.length; i++) {
    const persona = personas.value[i];
    if (!edadValidaParaGrupo(codigoDeGrupo(i), Number(persona.edad))) {
      const datos = buscarGrupo(codigoDeGrupo(i));
      const quien = personas.value.length > 1 ? `Persona ${i + 1}: para` : "Para";
      return `${quien} "${datos.nombre}" la edad tiene que estar entre ${datos.edadMin} y ${datos.edadMax} años.`;
    }
  }
  return "";
}

// Lista que se envía al back, con la edad como número
function personasParaEnviar() {
  const lista = [];
  for (const persona of personas.value) {
    lista.push({
      nombre: persona.nombre.trim(),
      edad: Number(persona.edad),
      grupoEdad: codigoDeGrupo(lista.length),
    });
  }
  return lista;
}

async function enviarSolicitud() {
  if (
    !grupoEdad.value ||
    !tipoCuidado.value ||
    faltaDireccion() ||
    !fechaInicio.value ||
    !horaInicio.value ||
    !horaFin.value ||
    faltanDatosDePersonas()
  ) {
    error.value = "Por favor, rellena todos los campos obligatorios.";
    return;
  }
  const errorEdad = errorDeEdadPorGrupo();
  if (errorEdad) {
    error.value = errorEdad;
    return;
  }
  // Las fechas tienen formato AAAA-MM-DD, así que se pueden comparar como texto
  if (fechaFin.value && fechaFin.value < fechaInicio.value) {
    error.value = "La fecha de fin no puede ser anterior a la de inicio.";
    return;
  }
  // Si el cuidado dura un solo día, la hora de fin tiene que ser posterior a la de inicio
  // (las horas tienen formato HH:mm, así que también se pueden comparar como texto)
  const variosDias = fechaFin.value && fechaFin.value > fechaInicio.value;
  if (!variosDias && horaFin.value <= horaInicio.value) {
    error.value = "La hora de fin tiene que ser posterior a la de inicio.";
    return;
  }
  error.value = "";

  try {
    const solicitudCreada = await solicitudRepository.create({
      tipoCuidado: tipoCuidado.value,
      direccion: direccionCompleta(),
      personas: personasParaEnviar(),
      grupoEdad: grupoEdad.value,
      notas: notas.value,
      fechaCuidado: fechaInicio.value,
      fechaFin: fechaFin.value || null,
      horaInicio: horaInicio.value,
      horaFin: horaFin.value,
      familiaId: authStore.id,
      cuidadorId: Number(cuidadorId),
      necesidades: necesidades.value,
    });
    router.push({ name: "confirmacion", query: { id: solicitudCreada.id } });
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo enviar la solicitud.");
  }
}
</script>

<template>
  <div class="solicitar pantalla">
    <RouterLink :to="`/cuidador/${route.params.id}`" class="solicitar__back"
      >← Volver al perfil</RouterLink
    >

    <h1>Solicitar a {{ cuidadorNombre }}</h1>
    <p class="solicitar__subtitle">
      Cinco datos y listo. Puedes cambiarlos después hablando con la persona cuidadora.
    </p>

    <div class="solicitar__box tarjeta-cristal">
      <div class="solicitar__cabecera">
        <span class="solicitar__icono">📝</span>
        <span class="solicitar__aviso">
          Cuanto más detalle des, mejor podrá prepararse la persona cuidadora.
        </span>
      </div>

      <form class="formulario solicitar__form" @submit.prevent="enviarSolicitud">
          <p class="formulario__nota">Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
        <h2 class="titulo-seccion obligatorio" data-icono="👥">¿Quién necesita cuidados?</h2>
        <div class="solicitar__grupos">
          <SelectorGrupos
            v-model="grupoEdad"
            ocultar-legend
            legend="Grupo de edad de la persona cuidada"
            name="grupo-solicitud"
          />
        </div>

        <h2 class="titulo-seccion obligatorio" data-icono="🩺">Tipo de cuidado</h2>
        <div class="solicitar__opciones">
          <button
            type="button"
            class="solicitar__opcion"
            :class="{
              'solicitar__opcion--active': tipoCuidado === 'hospitalario',
            }"
            @click="tipoCuidado = 'hospitalario'"
          >
            🏥 Hospitalario
          </button>
          <button
            type="button"
            class="solicitar__opcion"
            :class="{
              'solicitar__opcion--active': tipoCuidado === 'domicilio',
            }"
            @click="tipoCuidado = 'domicilio'"
          >
            🏠 A domicilio
          </button>
        </div>

        <h2 class="titulo-seccion" data-icono="📍">¿Dónde y cuándo?</h2>

        <template v-if="tipoCuidado === 'hospitalario'">
          <label class="obligatorio" for="hospital">Hospital</label>
          <input
            type="text"
            id="hospital"
              aria-required="true"
            v-model="hospital"
            maxlength="100"
            placeholder="Hospital de Cabueñes"
          />

          <label class="obligatorio" for="ubicacion">Planta, área y habitación</label>
          <input
            type="text"
            id="ubicacion"
              aria-required="true"
            v-model="ubicacionHospital"
            maxlength="90"
            placeholder="Planta 2, Medicina Interna, habitación 214"
          />
        </template>

        <template v-if="tipoCuidado === 'domicilio'">
          <label class="obligatorio" for="direccion">Dirección del domicilio</label>
          <input
            type="text"
            id="direccion"
              aria-required="true"
            v-model="direccion"
            maxlength="200"
            placeholder="Calle Uría 10, 3º B, Oviedo"
          />
        </template>

        <div class="solicitar__row">
          <div>
            <label class="obligatorio" for="fecha">Fecha de inicio</label>
            <input type="date" id="fecha"
              aria-required="true" v-model="fechaInicio" />
          </div>
          <div>
            <label for="fecha-fin">Fecha de fin (opcional)</label>
            <input
              type="date"
              id="fecha-fin"
              v-model="fechaFin"
              :min="fechaInicio"
            />
          </div>
        </div>

        <div class="solicitar__row">
          <div>
            <label class="obligatorio" for="hora-inicio">Hora de inicio</label>
            <input type="time" id="hora-inicio"
              aria-required="true" v-model="horaInicio" />
          </div>
          <div>
            <label class="obligatorio" for="hora-fin">Hora de fin</label>
            <input type="time" id="hora-fin"
              aria-required="true" v-model="horaFin" />
          </div>
        </div>
        <p class="solicitar__ayuda">
          Si el cuidado dura varios días, la hora de inicio es la del primer día
          y la de fin la del último.
        </p>

        <h2 class="titulo-seccion" data-icono="👤">
          {{ personas.length > 1 ? "Las personas cuidadas" : "La persona cuidada" }}
        </h2>

        <p v-if="!grupo" class="solicitar__ayuda">
          Elige arriba quién necesita cuidados y te pediremos los datos que hacen
          falta.
        </p>

        <template v-else>
          <div
            v-for="(persona, indice) in personas"
            :key="indice"
            class="solicitar__persona"
          >
            <p v-if="personas.length > 1" class="solicitar__titulo-grupo">
              Persona {{ indice + 1 }}
            </p>
            <div class="solicitar__row">
              <div>
                <label class="obligatorio" :for="indice === 0 ? 'paciente' : 'paciente-' + (indice + 1)"
                  >Nombre de la persona cuidada</label
                >
                <input
                  type="text"
                  :id="indice === 0 ? 'paciente' : 'paciente-' + (indice + 1)"
                  v-model="persona.nombre"
                  maxlength="100"
                  :placeholder="grupoDePersona(indice).ejemploNombre"
                />
              </div>
              <div>
                <label class="obligatorio" :for="indice === 0 ? 'edad' : 'edad-' + (indice + 1)"
                  >Edad de la persona cuidada</label
                >
                <input
                  type="number"
                  :id="indice === 0 ? 'edad' : 'edad-' + (indice + 1)"
                  v-model="persona.edad"
                  :min="grupoDePersona(indice).edadMin"
                  :max="grupoDePersona(indice).edadMax"
                  step="1"
                  :placeholder="grupoDePersona(indice).ejemploEdad"
                />
              </div>
            </div>

            <!-- Con varias personas, cada una enseña su grupo (el de la primera es el de arriba) -->
            <div v-if="personas.length > 1" class="solicitar__grupo-persona">
              <label class="obligatorio" :for="'grupo-' + (indice + 1)">Grupo de edad</label>
              <select
                :id="'grupo-' + (indice + 1)"
                :value="codigoDeGrupo(indice)"
                @change="cambiarGrupo(indice, $event.target.value)"
              >
                <option value="">Elige un grupo</option>
                <option
                  v-for="opcion in GRUPOS"
                  :key="opcion.codigo"
                  :value="opcion.codigo"
                >
                  {{ opcion.nombre }} ({{ opcion.edades }})
                </option>
              </select>
            </div>

            <button
              v-if="indice > 0"
              type="button"
              class="btn btn--secondary solicitar__quitar"
              @click="quitarPersona(indice)"
            >
              Quitar a la persona {{ indice + 1 }}
            </button>
          </div>

          <p v-if="personas.length > 1" class="solicitar__ayuda">
            Cada persona tiene su propio grupo de edad: así puedes pedir, por
            ejemplo, tres niños y un abuelo en la misma solicitud.
          </p>

          <button
            v-if="personas.length < 5"
            type="button"
            class="btn btn--secondary solicitar__anadir"
            @click="anadirPersona"
          >
            + Añadir otra persona
          </button>
          <p v-else class="solicitar__ayuda">
            Puedes indicar hasta 5 personas en una misma solicitud.
          </p>

          <p class="solicitar__titulo-grupo">
            Necesidades de la persona cuidada (opcional)
          </p>
          <div class="solicitar__necesidades">
            <label
              v-for="cuidado in CUIDADOS"
              :key="cuidado.codigo"
              class="solicitar__check"
              :class="{
                'solicitar__check--marcado': necesidades.includes(
                  cuidado.codigo,
                ),
              }"
            >
              <input
                type="checkbox"
                :id="'necesidad-' + cuidado.codigo"
                :value="cuidado.codigo"
                v-model="necesidades"
              />
              {{ cuidado.nombre }}
            </label>
          </div>

          <label for="notas">Información sobre la persona cuidada</label>
          <textarea
            id="notas"
            v-model="notas"
            :placeholder="grupo.ejemploNotas"
          ></textarea>
        </template>

        <div v-if="estimacion" class="solicitar__precio" data-testid="precio-estimado">
          <p class="solicitar__titulo-grupo">Precio estimado</p>
          <p class="solicitar__precio-linea">
            {{ estimacion.horas }} {{ estimacion.horas === 1 ? "hora" : "horas" }}
            × {{ formatearEuros(estimacion.tarifaHora) }}/hora =
            {{ formatearEuros(estimacion.base) }}
          </p>
          <p v-if="estimacion.personasExtra > 0" class="solicitar__precio-linea">
            + {{ estimacion.personasExtra }}
            {{ estimacion.personasExtra === 1 ? "persona extra" : "personas extra" }}
            ({{ estimacion.recargoPorcentaje }} % cada una) =
            {{ formatearEuros(estimacion.recargo) }}
          </p>
          <p class="solicitar__precio-total">
            Total estimado: {{ formatearEuros(estimacion.total) }}
          </p>
          <p class="solicitar__ayuda" data-testid="desplazamiento-incluido">
            La tarifa incluye el desplazamiento de la persona cuidadora.
          </p>
          <p class="solicitar__ayuda">
            Es una estimación. El importe final se calcula cuando la persona
            cuidadora completa el servicio y lo pagas desde "Mis pagos".
          </p>
        </div>

        <p role="alert" v-if="error" class="solicitar__error">{{ error }}</p>

        <button type="submit" class="btn btn--primary">Enviar solicitud</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.solicitar {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 20px;
  /* width: 100% hace falta porque, con margin auto, la caja se encoge al contenido */
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.solicitar__back {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--color-text);
  text-decoration: none;
}

.solicitar h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.solicitar__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.solicitar__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.solicitar__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.solicitar__box::after {
  display: none;
}

/* Franja de color con un icono y un aviso corto */
.solicitar__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.solicitar__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-white);
  font-size: 1.8rem;
}

.solicitar__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y títulos de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.solicitar__form {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }

  /* Dentro del formulario para ganar a la regla "label" de base.css (negrita) */
  & .solicitar__check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: normal;
    font-size: 0.95rem;
    margin-bottom: 0;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    background-color: var(--color-white);
    cursor: pointer;
  }

  & .solicitar__check--marcado {
    border-color: var(--color-accent);
    background-color: var(--color-accent-bg);
    font-weight: bold;
  }

  & .solicitar__check input {
    accent-color: var(--color-accent);
    width: 16px;
    height: 16px;
    padding: 0;
    margin: 0;
  }

  & .btn {
    padding: 14px;
  }
}

.solicitar__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;

  & > div {
    display: flex;
    flex-direction: column;
  }
}

.solicitar__persona {
  margin-bottom: var(--gap-sm);
}

.solicitar__grupo-persona {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--gap-sm);
}

.solicitar__anadir,
.solicitar__quitar {
  margin-bottom: var(--gap-md);
}

/* "Quitar" va en rojo suave para que se vea que borra a una persona (el selector largo gana a .btn--secondary) */
.solicitar__form .solicitar__quitar {
  background-color: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error);
}

@media (hover: hover) {
  .solicitar__form .solicitar__quitar:hover {
    border-color: var(--color-error);
  }
}

.solicitar__titulo-grupo {
  font-weight: bold;
  font-size: 0.95rem;
  margin: 0 0 8px;
}

/* Aviso mientras no se ha elegido el grupo de edad */
.solicitar__precio {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: var(--gap-sm) var(--gap-md);
  margin: var(--gap-md) 0;
}

.solicitar__precio-linea {
  margin: 0 0 4px;
}

.solicitar__precio-total {
  font-weight: 700;
  font-size: 1.1rem;
  margin: var(--gap-sm) 0 4px;
}

.solicitar__ayuda {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 var(--gap-md);
}

.solicitar__grupos {
  margin-bottom: var(--gap-md);
}

.solicitar__necesidades {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: var(--gap-md);
}

.solicitar__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.solicitar__opciones {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-md);
}

.solicitar__opcion {
  flex: 1;
  padding: 14px 10px;
  border-radius: var(--radius-input);
  border: 2px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
}

.solicitar__opcion--active {
  border-color: var(--color-accent);
  background-color: var(--color-accent-bg);
  font-weight: bold;
}

@media (hover: hover) {
  .solicitar__form .solicitar__check:hover,
  .solicitar__opcion:hover {
    border-color: var(--color-accent);
  }
}

@media (max-width: 768px) {
  .solicitar {
    padding: 24px 16px;
  }

  .solicitar__cabecera {
    padding: 20px;
  }

  .solicitar__form {
    padding: 24px 20px 28px;
  }

  .solicitar__row {
    grid-template-columns: 1fr;
  }

  .solicitar__necesidades {
    grid-template-columns: 1fr;
  }
}
</style>