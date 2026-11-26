<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import SelectorGrupos from "@/components/SelectorGrupos.vue";
import { CUIDADOS } from "@/utils/catalogoCuidados";
import { GRUPOS, buscarGrupo } from "@/utils/catalogoGrupos";
import {
  validarSolicitud,
  ordenDeCampos,
  campoDeSolicitud,
  fechaDeHoy,
} from "@/utils/validarSolicitud";
import {
  erroresDelServidor,
  primerCampoConError,
  hayErrores,
} from "@/utils/erroresDeCampos";
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
// Aviso general (arriba del botón) y errores de cada campo: { campo: "mensaje" }
const error = ref("");
const errores = ref({});
// Fecha de hoy, para que no se pueda elegir una fecha pasada
const hoy = fechaDeHoy();
const MENSAJE_REVISAR = "Revisa los campos marcados en rojo.";

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

// Clave del error de un campo de una persona, por ejemplo "personas.0.nombre"
function clave(indice, campo) {
  return `personas.${indice}.${campo}`;
}

// Atributos de accesibilidad de un campo con error: lo marca como inválido y lo une a su mensaje
function ariaInvalido(campo) {
  return errores.value[campo] ? "true" : undefined;
}

function ariaDescrito(campo) {
  return errores.value[campo] ? "error-" + campo : undefined;
}

// Los datos del formulario tal como los pide validarSolicitud
function datosDelFormulario() {
  const lista = [];
  for (let i = 0; i < personas.value.length; i++) {
    lista.push({
      nombre: personas.value[i].nombre,
      edad: personas.value[i].edad,
      grupoEdad: codigoDeGrupo(i),
    });
  }
  return {
    grupoEdad: grupoEdad.value,
    tipoCuidado: tipoCuidado.value,
    hospital: hospital.value,
    ubicacionHospital: ubicacionHospital.value,
    direccion: direccion.value,
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    horaInicio: horaInicio.value,
    horaFin: horaFin.value,
    personas: lista,
    notas: notas.value,
  };
}

// Id del elemento de cada campo, para llevar el cursor al primero con error
function idDelCampo(campo) {
  const fijos = {
    hospital: "hospital",
    ubicacionHospital: "ubicacion",
    direccion: "direccion",
    fechaInicio: "fecha",
    fechaFin: "fecha-fin",
    horaInicio: "hora-inicio",
    horaFin: "hora-fin",
    notas: "notas",
  };
  if (fijos[campo]) {
    return fijos[campo];
  }
  // Campos de una persona: "personas.1.edad" -> "edad-2" (la primera no lleva número)
  const partes = campo.split(".");
  if (partes[0] !== "personas") {
    return "";
  }
  const numero = Number(partes[1]) + 1;
  const sufijo = numero === 1 ? "" : "-" + numero;
  if (partes[2] === "nombre") {
    return "paciente" + sufijo;
  }
  if (partes[2] === "edad") {
    return "edad" + sufijo;
  }
  return "grupo-" + numero;
}

async function llevarElCursorAlPrimerError() {
  const campo = primerCampoConError(errores.value, ordenDeCampos(personas.value.length));
  await nextTick();
  let elemento = null;
  if (campo === "grupoEdad") {
    elemento = document.querySelector('input[name="grupo-solicitud"]');
  } else if (campo === "tipoCuidado") {
    elemento = document.querySelector(".solicitar__opcion");
  } else if (campo) {
    elemento = document.getElementById(idDelCampo(campo));
  }
  if (elemento) {
    elemento.focus();
  }
}

// Los errores del servidor se muestran bajo los campos que existen en pantalla.
// El back habla de "direccion" aunque un hospital se escriba en dos campos
function erroresDelServidorParaLaPantalla(err) {
  const delServidor = erroresDelServidor(err, campoDeSolicitud);
  if (delServidor.direccion && tipoCuidado.value === "hospitalario") {
    delServidor.hospital = delServidor.direccion;
    delete delServidor.direccion;
  }
  const visibles = {};
  for (const campo of ordenDeCampos(personas.value.length)) {
    if (delServidor[campo]) {
      visibles[campo] = delServidor[campo];
    }
  }
  return visibles;
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
  errores.value = validarSolicitud(datosDelFormulario());
  if (hayErrores(errores.value)) {
    error.value = MENSAJE_REVISAR;
    await llevarElCursorAlPrimerError();
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
    // Si el back dice qué campos fallan, se marcan; si no, un aviso general según el código HTTP
    errores.value = erroresDelServidorParaLaPantalla(err);
    if (hayErrores(errores.value)) {
      error.value = MENSAJE_REVISAR;
      await llevarElCursorAlPrimerError();
      return;
    }
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
        <p v-if="errores.grupoEdad" id="error-grupoEdad" class="campo-error">{{ errores.grupoEdad }}</p>

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
        <p v-if="errores.tipoCuidado" id="error-tipoCuidado" class="campo-error">{{ errores.tipoCuidado }}</p>

        <h2 class="titulo-seccion" data-icono="📍">¿Dónde y cuándo?</h2>

        <template v-if="tipoCuidado === 'hospitalario'">
          <label class="obligatorio" for="hospital">Hospital</label>
          <input
            type="text"
            id="hospital"
              aria-required="true"
            :aria-invalid="ariaInvalido('hospital')" :aria-describedby="ariaDescrito('hospital')"
            v-model="hospital"
            maxlength="100"
            placeholder="Hospital de Cabueñes"
          />
          <p v-if="errores.hospital" id="error-hospital" class="campo-error">{{ errores.hospital }}</p>

          <label class="obligatorio" for="ubicacion">Planta, área y habitación</label>
          <input
            type="text"
            id="ubicacion"
              aria-required="true"
            :aria-invalid="ariaInvalido('ubicacionHospital')" :aria-describedby="ariaDescrito('ubicacionHospital')"
            v-model="ubicacionHospital"
            maxlength="90"
            placeholder="Planta 2, Medicina Interna, habitación 214"
          />
          <p v-if="errores.ubicacionHospital" id="error-ubicacionHospital" class="campo-error">{{ errores.ubicacionHospital }}</p>
        </template>

        <template v-if="tipoCuidado === 'domicilio'">
          <label class="obligatorio" for="direccion">Dirección del domicilio</label>
          <input
            type="text"
            id="direccion"
              aria-required="true"
            :aria-invalid="ariaInvalido('direccion')" :aria-describedby="ariaDescrito('direccion')"
            v-model="direccion"
            maxlength="200"
            placeholder="Calle Uría 10, 3º B, Oviedo"
          />
          <p v-if="errores.direccion" id="error-direccion" class="campo-error">{{ errores.direccion }}</p>
        </template>

        <div class="solicitar__row">
          <div>
            <label class="obligatorio" for="fecha">Fecha de inicio</label>
            <input
              type="date"
              id="fecha"
              aria-required="true"
              :min="hoy"
              :aria-invalid="ariaInvalido('fechaInicio')" :aria-describedby="ariaDescrito('fechaInicio')"
              v-model="fechaInicio"
            />
            <p v-if="errores.fechaInicio" id="error-fechaInicio" class="campo-error">{{ errores.fechaInicio }}</p>
          </div>
          <div>
            <label for="fecha-fin">Fecha de fin (opcional)</label>
            <input
              type="date"
              id="fecha-fin"
              v-model="fechaFin"
              :min="fechaInicio || hoy"
              :aria-invalid="ariaInvalido('fechaFin')" :aria-describedby="ariaDescrito('fechaFin')"
            />
            <p v-if="errores.fechaFin" id="error-fechaFin" class="campo-error">{{ errores.fechaFin }}</p>
          </div>
        </div>

        <div class="solicitar__row">
          <div>
            <label class="obligatorio" for="hora-inicio">Hora de inicio</label>
            <input
              type="time"
              id="hora-inicio"
              aria-required="true"
              :aria-invalid="ariaInvalido('horaInicio')" :aria-describedby="ariaDescrito('horaInicio')"
              v-model="horaInicio"
            />
            <p v-if="errores.horaInicio" id="error-horaInicio" class="campo-error">{{ errores.horaInicio }}</p>
          </div>
          <div>
            <label class="obligatorio" for="hora-fin">Hora de fin</label>
            <input
              type="time"
              id="hora-fin"
              aria-required="true"
              :aria-invalid="ariaInvalido('horaFin')" :aria-describedby="ariaDescrito('horaFin')"
              v-model="horaFin"
            />
            <p v-if="errores.horaFin" id="error-horaFin" class="campo-error">{{ errores.horaFin }}</p>
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
                  :aria-invalid="ariaInvalido(clave(indice, 'nombre'))"
                  :aria-describedby="ariaDescrito(clave(indice, 'nombre'))"
                  v-model="persona.nombre"
                  maxlength="100"
                  :placeholder="grupoDePersona(indice).ejemploNombre"
                />
                <p
                  v-if="errores[clave(indice, 'nombre')]"
                  :id="'error-' + clave(indice, 'nombre')"
                  class="campo-error"
                >
                  {{ errores[clave(indice, 'nombre')] }}
                </p>
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
                  :aria-invalid="ariaInvalido(clave(indice, 'edad'))"
                  :aria-describedby="ariaDescrito(clave(indice, 'edad'))"
                  :placeholder="grupoDePersona(indice).ejemploEdad"
                />
                <p
                  v-if="errores[clave(indice, 'edad')]"
                  :id="'error-' + clave(indice, 'edad')"
                  class="campo-error"
                >
                  {{ errores[clave(indice, 'edad')] }}
                </p>
              </div>
            </div>

            <!-- Con varias personas, cada una enseña su grupo (el de la primera es el de arriba) -->
            <div v-if="personas.length > 1" class="solicitar__grupo-persona">
              <label class="obligatorio" :for="'grupo-' + (indice + 1)">Grupo de edad</label>
              <select
                :id="'grupo-' + (indice + 1)"
                :value="codigoDeGrupo(indice)"
                :aria-invalid="ariaInvalido(clave(indice, 'grupoEdad'))"
                :aria-describedby="ariaDescrito(clave(indice, 'grupoEdad'))"
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
              <p
                v-if="errores[clave(indice, 'grupoEdad')]"
                :id="'error-' + clave(indice, 'grupoEdad')"
                class="campo-error"
              >
                {{ errores[clave(indice, 'grupoEdad')] }}
              </p>
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
            :aria-invalid="ariaInvalido('notas')"
            :aria-describedby="ariaDescrito('notas')"
            :placeholder="grupo.ejemploNotas"
          ></textarea>
          <p v-if="errores.notas" id="error-notas" class="campo-error">{{ errores.notas }}</p>
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