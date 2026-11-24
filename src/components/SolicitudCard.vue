<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import EtiquetaCuidado from "@/components/EtiquetaCuidado.vue";
import FichajeServicio from "@/components/FichajeServicio.vue";
import { nombreGrupo } from "@/utils/catalogoGrupos";
import { iconoTipo } from "@/utils/nombreTipo";
import {
  listaDePersonas,
  nombresDePersonas,
  resumenDePersonas,
  hayVariasPersonas,
  textoGrupos,
  hayVariosGrupos,
} from "@/utils/personasSolicitud";
import { formatearMomento } from "@/utils/formatearHora";
import { enlaceMapa } from "@/utils/enlaceMapa";

const props = defineProps([
  "solicitud",
  "nombreMostrado",
  "mostrarAcciones",
  "pagado",
  "valorada",
  "aceptar",
  "rechazar",
  "completar",
  "mensajesSinLeer",
]);

// Cuántos mensajes del chat tiene sin leer la persona en esta solicitud
const sinLeer = computed(() => Number(props.mensajesSinLeer) || 0);

// El cuidador ve la tarjeta resumida y abre los detalles en una ventana con el botón Ver
const expandido = ref(false);

// La familia lo ve todo; el cuidador solo cuando pulsa Ver
const detallesVisibles = computed(
  () => !props.mostrarAcciones || expandido.value,
);

// El cuidador solo puede abrir los detalles cuando tiene que decidir o actuar:
// en una solicitud pendiente o aceptada. En las cerradas no hay nada más que hacer
const puedeVerDetalles = computed(
  () =>
    props.mostrarAcciones &&
    (props.solicitud.estado === "PENDIENTE" ||
      props.solicitud.estado === "ACEPTADA"),
);

// El cuidador solo ve la dirección cuando ya ha aceptado la solicitud
const direccionVisible = computed(
  () => !props.mostrarAcciones || props.solicitud.estado === "ACEPTADA",
);

// Al cuidador con una solicitud pendiente se le avisa de que la dirección llegará al aceptar
const avisoDireccion = computed(
  () => props.mostrarAcciones && props.solicitud.estado === "PENDIENTE",
);
</script>

<template>
  <div
    class="solicitudes__card tarjeta-cristal"
    :class="[
      'solicitudes__card--' + solicitud.estado.toLowerCase(),
      { 'solicitudes__card--abierta': mostrarAcciones && expandido },
    ]"
  >
    <div class="solicitudes__card-top">
      <h3>{{ nombreMostrado }}</h3>
      <span
        class="solicitudes__estado"
        :class="'solicitudes__estado--' + solicitud.estado.toLowerCase()"
      >
        {{
          solicitud.estado === "PENDIENTE"
            ? "Pendiente"
            : solicitud.estado === "ACEPTADA"
              ? "Aceptada"
              : solicitud.estado === "RECHAZADA"
                ? "Rechazada"
                : "Completada"
        }}
      </span>
    </div>

    <p class="solicitudes__paciente">{{ nombresDePersonas(solicitud) }}</p>
    <p v-if="hayVariasPersonas(solicitud)" class="solicitudes__personas">
      👥 {{ listaDePersonas(solicitud).length }} personas:
      {{ resumenDePersonas(solicitud) }}
    </p>

    <ul class="solicitudes__detalles">
      <li class="solicitudes__tipo">
        {{ iconoTipo(solicitud.tipoCuidado) }} {{ solicitud.tipoCuidado }}
      </li>
      <li v-if="textoGrupos(solicitud)" class="solicitudes__grupo">
        👥
        <strong>{{
          hayVariosGrupos(solicitud) ? "Grupos de edad:" : "Grupo de edad:"
        }}</strong>
        {{ textoGrupos(solicitud) }}
      </li>
      <li>
        📅 <strong>Inicio:</strong>
        {{ formatearMomento(solicitud.fechaCuidado, solicitud.horaInicio) }}
      </li>
      <li v-if="solicitud.fechaFin || solicitud.horaFin">
        📅 <strong>Fin:</strong>
        {{
          formatearMomento(
            solicitud.fechaFin || solicitud.fechaCuidado,
            solicitud.horaFin,
          )
        }}
      </li>
    </ul>

    <button
      v-if="puedeVerDetalles"
      class="solicitudes__ver"
      @click="expandido = true"
    >
      Ver detalles
    </button>

    <!-- La familia lo ve dentro de la tarjeta; el cuidador, en una ventana encima de todo -->
    <div
      v-if="detallesVisibles"
      :class="{ solicitudes__fondo: mostrarAcciones }"
      @click.self="expandido = false"
    >
      <div
        :class="{ solicitudes__modal: mostrarAcciones }"
        :role="mostrarAcciones ? 'dialog' : undefined"
        :aria-modal="mostrarAcciones ? 'true' : undefined"
      >
        <div class="solicitudes__modal-top" v-if="mostrarAcciones">
          <div>
            <h3>{{ nombreMostrado }}</h3>
          </div>
          <button
            class="solicitudes__cerrar"
            aria-label="Cerrar"
            @click="expandido = false"
          >
            ✕
          </button>
        </div>

        <!-- Resumen completo dentro de la ventana, para decidir sin cerrarla -->
        <template v-if="mostrarAcciones">
          <p class="solicitudes__bloque-titulo">
            👥 {{ hayVariasPersonas(solicitud) ? "Personas a cuidar" : "Persona a cuidar" }}
          </p>
          <ul class="solicitudes__lista-personas">
            <li
              v-for="(persona, indice) in listaDePersonas(solicitud)"
              :key="indice"
            >
              <strong>{{ persona.nombre }}</strong>
              <span v-if="persona.edad !== undefined && persona.edad !== null">
                · {{ persona.edad }} años
              </span>
              <span
                v-if="hayVariosGrupos(solicitud) && persona.grupoEdad"
                class="solicitudes__grupo-persona"
              >
                · {{ nombreGrupo(persona.grupoEdad) }}
              </span>
            </li>
          </ul>

          <p class="solicitudes__bloque-titulo">📅 Cuándo y qué tipo</p>
          <ul class="solicitudes__detalles solicitudes__detalles--modal">
            <li>
              {{ iconoTipo(solicitud.tipoCuidado) }} {{ solicitud.tipoCuidado }}
            </li>
            <li v-if="textoGrupos(solicitud)">
              👥
              <strong>{{
                hayVariosGrupos(solicitud) ? "Grupos de edad:" : "Grupo de edad:"
              }}</strong>
              {{ textoGrupos(solicitud) }}
            </li>
            <li>
              📅 <strong>Inicio:</strong>
              {{ formatearMomento(solicitud.fechaCuidado, solicitud.horaInicio) }}
            </li>
            <li v-if="solicitud.fechaFin || solicitud.horaFin">
              📅 <strong>Fin:</strong>
              {{
                formatearMomento(
                  solicitud.fechaFin || solicitud.fechaCuidado,
                  solicitud.horaFin,
                )
              }}
            </li>
          </ul>
        </template>

        <p
          class="solicitudes__bloque-titulo"
          v-if="
            mostrarAcciones &&
            solicitud.necesidades &&
            solicitud.necesidades.length > 0
          "
        >
          🩺 Necesidades
        </p>
        <div
          class="solicitudes__necesidades"
          v-if="solicitud.necesidades && solicitud.necesidades.length > 0"
        >
          <EtiquetaCuidado
            class="solicitudes__necesidad"
            v-for="codigo in solicitud.necesidades"
            :key="codigo"
            :codigo="codigo"
          />
        </div>

        <p
          class="solicitudes__bloque-titulo"
          v-if="
            mostrarAcciones &&
            (solicitud.direccion || solicitud.notas || avisoDireccion)
          "
        >
          🗒️ Más datos
        </p>
        <ul
          class="solicitudes__detalles"
          v-if="solicitud.direccion || solicitud.notas || avisoDireccion"
        >
          <li v-if="solicitud.direccion && direccionVisible">
            📍
            <strong class="solicitudes__direccion">{{
              solicitud.direccion
            }}</strong>
            <!-- El cuidador puede abrir la dirección en el mapa (en otra pestaña) para saber cómo llegar -->
            <a
              v-if="mostrarAcciones"
              :href="enlaceMapa(solicitud.direccion)"
              target="_blank"
              rel="noopener noreferrer"
              class="solicitudes__mapa"
              aria-label="Ver la dirección en el mapa (se abre en otra pestaña)"
            >
              🗺️ Ver en el mapa
            </a>
          </li>
          <li v-else-if="avisoDireccion" class="solicitudes__aviso">
            📍 La dirección se mostrará cuando aceptes la solicitud
          </li>
          <li v-if="solicitud.notas">📝 {{ solicitud.notas }}</li>
        </ul>

        <button
          v-if="mostrarAcciones"
          class="btn btn--secondary solicitudes__cerrar-btn"
          @click="expandido = false"
        >
          Cerrar
        </button>
      </div>
    </div>

    <div
      class="solicitudes__acciones"
      v-if="
        mostrarAcciones &&
        (solicitud.estado === 'PENDIENTE' ||
          (solicitud.estado === 'ACEPTADA' && completar))
      "
    >
      <template v-if="solicitud.estado === 'PENDIENTE'">
        <button
          class="btn solicitudes__btn-aceptar"
          @click="aceptar(solicitud.id)"
        >
          Aceptar
        </button>
        <button
          class="btn solicitudes__btn-rechazar"
          @click="rechazar(solicitud.id)"
        >
          Rechazar
        </button>
      </template>
      <button
        v-else
        class="btn solicitudes__btn-aceptar solicitudes__completar"
        @click="completar(solicitud.id)"
      >
        Marcar como completada
      </button>
    </div>

    <!-- La familia paga y valora al cuidador desde la tarjeta cuando la solicitud está completada -->
    <div
      class="solicitudes__acciones"
      v-if="!mostrarAcciones && solicitud.estado === 'COMPLETADA'"
    >
      <p v-if="pagado" class="solicitudes__pagado">Pagado ✓</p>
      <RouterLink v-else :to="`/pagar/${solicitud.id}`" class="btn btn--primary">
        Pagar
      </RouterLink>

      <p v-if="valorada" class="solicitudes__pagado">Valoración enviada ✓</p>
      <RouterLink
        v-else
        :to="`/valorar/${solicitud.id}`"
        class="btn btn--primary"
      >
        Dejar valoración
      </RouterLink>
    </div>

    <!-- Inicio y fin del servicio: la persona cuidadora ficha y la familia lo ve -->
    <FichajeServicio
      v-if="solicitud.estado === 'ACEPTADA' || solicitud.estado === 'COMPLETADA'"
      :solicitud="solicitud"
      :esCuidador="!!mostrarAcciones"
    />

    <!-- El chat está para la familia y para la persona cuidadora, salvo en las solicitudes rechazadas -->
    <div class="solicitudes__chat-fila" v-if="solicitud.estado !== 'RECHAZADA'">
      <RouterLink
        :to="`/chat/${solicitud.id}`"
        class="btn btn--secondary solicitudes__chat"
        :class="{ 'solicitudes__chat--nuevo': sinLeer > 0 }"
        :aria-label="sinLeer > 0 ? `Chat, ${sinLeer} mensajes sin leer` : null"
        data-testid="enlace-chat"
      >
        💬 Chat
        <span v-if="sinLeer > 0" class="solicitudes__chat-nuevos">{{ sinLeer }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* El aspecto de cristal (fondo, sombra, entrada y resplandor del ratón) viene de la clase global
   "tarjeta-cristal" (base.css). Aquí solo se ajusta lo propio de esta tarjeta.
   La ventana de detalles (position: fixed) está DENTRO de la tarjeta, y tanto "backdrop-filter" como
   "overflow: hidden" harían que se colocara respecto a la tarjeta y se recortara. Por eso se quitan. */
.solicitudes__card {
  display: flex;
  flex-direction: column;
  backdrop-filter: none;
  overflow: visible;
}

/* Sin overflow oculto, el resplandor tiene que redondear sus esquinas como la tarjeta */
.solicitudes__card::after {
  border-radius: inherit;
}

/* El color de la línea de arriba cambia según el estado de la solicitud */
/* Además de la línea de arriba, cada estado tiene su velo de color, para distinguirlas de un vistazo */
.solicitudes__card--pendiente {
  --borde-tarjeta: var(--color-accent);
  --tinte-tarjeta: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.solicitudes__card--aceptada {
  --borde-tarjeta: var(--color-secondary);
  --tinte-tarjeta: color-mix(in srgb, var(--color-secondary) 18%, transparent);
}

.solicitudes__card--completada {
  --borde-tarjeta: var(--color-info);
  --tinte-tarjeta: color-mix(in srgb, var(--color-info) 16%, transparent);
}

.solicitudes__card--rechazada {
  --borde-tarjeta: var(--color-border);
  --tinte-tarjeta: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
}

/* Las rechazadas se ven apagadas: ya no hay nada que hacer con ellas */
.solicitudes__card--rechazada .solicitudes__card-top h3,
.solicitudes__card--rechazada .solicitudes__paciente {
  color: var(--color-text-muted);
}

/* Una tarjeta con "transform" hace que la ventana de dentro (position: fixed) se coloque
   respecto a la tarjeta y no respecto a la pantalla, y parpadea. Con la ventana abierta
   la tarjeta no se mueve, ni siquiera al pasar el ratón, y no tiene transición.
   (La animación de entrada no se toca: si se quitara y se volviera a poner, se repetiría al cerrar.) */
.solicitudes__card.solicitudes__card--abierta,
.solicitudes__card.solicitudes__card--abierta:hover {
  transform: none;
  transition: none;
}

.solicitudes__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 4px;

  & h3 {
    margin: 0;
    font-size: 1.25rem;
  }
}

/* La etiqueta de estado lleva un icono (puesto con CSS, así el texto sigue siendo solo el estado) */
.solicitudes__estado {
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
  border: 1px solid currentColor;
}

.solicitudes__estado--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.solicitudes__estado--pendiente::before {
  content: "⏳ ";
}

.solicitudes__estado--aceptada {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.solicitudes__estado--aceptada::before {
  content: "✔ ";
}

.solicitudes__estado--completada {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.solicitudes__estado--completada::before {
  content: "🎉 ";
}

.solicitudes__estado--rechazada {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.solicitudes__estado--rechazada::before {
  content: "✕ ";
}

.solicitudes__paciente {
  color: var(--color-text);
  font-weight: bold;
  margin-bottom: 14px;
}

/* Cuántas personas se cuidan y su edad, cuando son varias */
.solicitudes__personas {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: -8px 0 14px;
  overflow-wrap: anywhere;
}

/* Los datos van dentro de un recuadro; su color depende del estado */
.solicitudes__detalles {
  list-style: none;
  padding: 12px 14px;
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: var(--color-text);
  background-color: var(--color-neutral-bg);
  border-radius: var(--radius-input);

  & li {
    margin-bottom: 6px;
  }

  & li:last-child {
    margin-bottom: 0;
  }
}

.solicitudes__detalles--modal {
  margin-bottom: 4px;
}

.solicitudes__card--pendiente .solicitudes__detalles {
  background-color: var(--color-accent-bg);
}

.solicitudes__card--aceptada .solicitudes__detalles {
  background-color: var(--color-secondary-bg);
}

.solicitudes__card--completada .solicitudes__detalles {
  background-color: var(--color-info-bg);
}

/* El tipo de cuidado llega en minúsculas del servidor; así sale con la primera en mayúscula */
.solicitudes__tipo {
  font-weight: bold;
  text-transform: capitalize;
}

.solicitudes__detalles li,
.solicitudes__paciente {
  overflow-wrap: anywhere;
}

.solicitudes__fondo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.solicitudes__modal {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  width: min(480px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-card);
  border-top: 4px solid var(--color-accent);
  animation: ventana-entra 0.25s var(--ease-out) backwards;
}

@keyframes ventana-entra {
  from {
    opacity: 0;
    translate: 0 16px;
  }
}

/* Títulos pequeños que separan los bloques de la ventana de detalles */
.solicitudes__bloque-titulo {
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin: 18px 0 8px;
}

.solicitudes__lista-personas {
  list-style: none;
  padding: 0;
  margin: 0 0 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  & li {
    background-color: var(--color-accent-bg);
    border-radius: var(--radius-input);
    padding: 8px 12px;
    overflow-wrap: anywhere;
  }
}

.solicitudes__modal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  & h3 {
    margin: 0 0 4px;
  }
}

/* La X de arriba: un círculo suave que se llena de coral al pasar el ratón y gira un poco */
.solicitudes__cerrar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-accent);
  background-color: var(--color-accent-bg);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-accent-dark);
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

.solicitudes__cerrar:hover {
  background-color: var(--color-accent);
  color: var(--color-white);
  transform: rotate(90deg);
}

/* El botón Cerrar de abajo: borde coral que se rellena al pasar el ratón */
.solicitudes__cerrar-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background-color: var(--color-white);
  border: 2px solid var(--color-accent);
  color: var(--color-accent-dark);
  font-weight: bold;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.solicitudes__cerrar-btn:hover:not(:disabled) {
  background-color: var(--color-accent);
  color: var(--color-white);
}

/* Enlace al mapa: una pastilla verde que se llena al pasar el ratón */
.solicitudes__mapa {
  display: inline-block;
  margin-top: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-weight: bold;
  font-size: 0.9rem;
  text-decoration: none;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.solicitudes__mapa:hover {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.solicitudes__aviso {
  color: var(--color-text-muted);
  font-style: italic;
}

.solicitudes__acciones {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-sm);
  border-top: 1px solid var(--color-border);
  padding-top: 16px;

  /* Cada botón pide al menos 100px; si no caben todos en una fila, el último baja */
  & .btn {
    flex: 1 1 100px;
    padding: 12px;
    text-align: center;
    text-decoration: none;
  }
}

/* Fila del chat: va aparte de los botones de acción para no mezclarse con ellos */
.solicitudes__chat-fila {
  display: flex;
  margin-top: 12px;

  /* Verde suave de la paleta para que el chat se note más que un botón gris */
  & .btn {
    flex: 1;
    padding: 12px;
    text-align: center;
    text-decoration: none;
    background-color: var(--color-secondary-bg);
    border: 1px solid var(--color-secondary);
    color: var(--color-secondary);
    font-weight: bold;
    transition:
      background-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out);
  }

  & .btn:hover {
    background-color: var(--color-secondary);
    color: var(--color-white);
  }
}

/* Con mensajes sin leer el botón se llena de verde y sale un círculo coral con el número */
.solicitudes__chat-fila .solicitudes__chat--nuevo {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.solicitudes__chat-nuevos {
  display: inline-block;
  min-width: 22px;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent);
  color: var(--color-white);
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Colores de la paleta: verde para aceptar y borde coral para rechazar */
.solicitudes__btn-aceptar {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.solicitudes__btn-rechazar {
  background-color: var(--color-white);
  color: var(--color-text);
  border: 1px solid var(--color-accent);
}

.solicitudes__btn-aceptar:hover,
.solicitudes__btn-rechazar:hover {
  filter: brightness(0.95);
}

/* "Ver detalles" es un enlace de texto, igual de grande en todas las tarjetas */
.solicitudes__ver {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  margin: 0 0 20px;
  color: var(--color-info);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.solicitudes__pagado {
  flex: 1;
  margin: 0;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-weight: bold;
  text-align: center;
}

.solicitudes__necesidades {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.solicitudes__necesidad {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
}

/* Las etiquetas alternan coral, verde y azul para distinguirse entre sí */
.solicitudes__necesidad:nth-child(3n + 2) {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.solicitudes__necesidad:nth-child(3n + 3) {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}
</style>