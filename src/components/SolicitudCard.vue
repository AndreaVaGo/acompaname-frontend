<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { nombreCuidado } from "@/utils/catalogoCuidados";
import { nombreGrupo } from "@/utils/catalogoGrupos";
import {
  listaDePersonas,
  nombresDePersonas,
  resumenDePersonas,
  hayVariasPersonas,
  textoGrupos,
  hayVariosGrupos,
} from "@/utils/personasSolicitud";
import { formatearMomento } from "@/utils/formatearHora";

const props = defineProps([
  "solicitud",
  "nombreMostrado",
  "mostrarAcciones",
  "pagado",
  "valorada",
  "aceptar",
  "rechazar",
  "completar",
]);

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
    class="solicitudes__card"
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
      <li class="solicitudes__tipo">🏠 {{ solicitud.tipoCuidado }}</li>
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
            <p class="solicitudes__paciente">{{ nombresDePersonas(solicitud) }}</p>
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
            <li>🏠 {{ solicitud.tipoCuidado }}</li>
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
          <span
            class="solicitudes__necesidad"
            v-for="codigo in solicitud.necesidades"
            :key="codigo"
          >
            {{ nombreCuidado(codigo) }}
          </span>
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
  </div>
</template>

<style scoped>
.solicitudes__card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 6px solid var(--color-border);
  padding: 24px 24px 24px 22px;
  box-shadow: var(--shadow-card);
  transition: transform 0.15s;
}

/* El color del borde lateral cambia según el estado de la solicitud */
.solicitudes__card--pendiente {
  border-left-color: var(--color-accent);
}

.solicitudes__card--aceptada {
  border-left-color: var(--color-secondary);
}

.solicitudes__card--completada {
  border-left-color: var(--color-info);
}

.solicitudes__card--rechazada {
  border-left-color: var(--color-border);
}

/* Una tarjeta con "transform" hace que la ventana de dentro (position: fixed) se coloque
   respecto a la tarjeta y no respecto a la pantalla, y parpadea. Con la ventana abierta
   la tarjeta no se mueve y no tiene transición. */
.solicitudes__card--abierta {
  transition: none;
}

@media (hover: hover) {
  .solicitudes__card:not(.solicitudes__card--abierta):hover {
    transform: translateY(-3px);
  }
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

.solicitudes__estado {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.solicitudes__estado--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.solicitudes__estado--aceptada {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.solicitudes__estado--completada {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.solicitudes__estado--rechazada {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
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

.solicitudes__cerrar {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.solicitudes__cerrar-btn {
  width: 100%;
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