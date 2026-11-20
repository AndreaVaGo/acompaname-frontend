<script setup>
import { ref, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import { formatearMomento } from "@/utils/formatearHora";
import { mensajeDeError } from "@/utils/mensajeDeError";
import {
  detalleDePersonas,
  hayVariasPersonas,
  textoGrupos,
  hayVariosGrupos,
} from "@/utils/personasSolicitud";

const route = useRoute();
const solicitudRepository = new SolicitudRepository();

const solicitud = ref(null);
const error = ref("");

const tipos = {
  hospitalario: "Hospital",
  domicilio: "Domicilio",
};

onMounted(async () => {
  try {
    solicitud.value = await solicitudRepository.getById(route.query.id);
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudieron cargar los datos de la solicitud.");
  }
});
</script>

<template>
  <div class="confirmacion pantalla">
    <div class="confirmacion__box tarjeta-cristal">
      <!-- Un círculo y un tic que se dibujan al llegar. Es solo decoración: el título ya dice que se ha enviado -->
      <div class="confirmacion__icon" aria-hidden="true" data-testid="confirmacion-icono">
        <svg viewBox="0 0 52 52" width="64" height="64" fill="none">
          <circle class="confirmacion__circulo" cx="26" cy="26" r="24" />
          <path class="confirmacion__tic" d="M15 27l8 8 15-16" />
        </svg>
      </div>

      <h1>Solicitud enviada</h1>
      <p v-if="solicitud" class="confirmacion__texto">
        Hemos avisado a <strong>{{ solicitud.cuidadorNombre }}</strong
        >. Recibirás un aviso en cuanto responda, normalmente en menos de 24
        horas.
      </p>
      <p v-if="error" class="confirmacion__texto">{{ error }}</p>

      <div v-if="solicitud" class="confirmacion__resumen">
        <div class="confirmacion__fila">
          <span>Tipo de cuidado</span>
          <strong>{{ tipos[solicitud.tipoCuidado] || solicitud.tipoCuidado }}</strong>
        </div>
        <div class="confirmacion__fila">
          <span>Fecha de inicio</span>
          <strong>{{
            formatearMomento(solicitud.fechaCuidado, solicitud.horaInicio)
          }}</strong>
        </div>
        <div
          v-if="solicitud.fechaFin || solicitud.horaFin"
          class="confirmacion__fila"
        >
          <span>Fecha de fin</span>
          <strong>{{
            formatearMomento(
              solicitud.fechaFin || solicitud.fechaCuidado,
              solicitud.horaFin,
            )
          }}</strong>
        </div>
        <div v-if="textoGrupos(solicitud)" class="confirmacion__fila">
          <span>{{ hayVariosGrupos(solicitud) ? "Grupos de edad" : "Grupo de edad" }}</span>
          <strong>{{ textoGrupos(solicitud) }}</strong>
        </div>
        <div class="confirmacion__fila">
          <span>{{ hayVariasPersonas(solicitud) ? "Personas cuidadas" : "Persona cuidada" }}</span>
          <strong>{{ detalleDePersonas(solicitud) }}</strong>
        </div>
      </div>

      <div class="confirmacion__acciones">
        <RouterLink to="/solicitudes" class="btn btn--primary"
          >Ver mis solicitudes</RouterLink
        >
        <RouterLink to="/buscar" class="btn btn--secondary"
          >Seguir buscando</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmacion {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal.
   El aro del tic se expande fuera de la tarjeta, así que no se recorta (overflow: visible) */
.confirmacion__box {
  --borde-tarjeta: var(--color-secondary);
  padding: 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  overflow: visible;
}

.confirmacion__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.confirmacion__box::after {
  display: none;
}

.confirmacion__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  /* Un aro suave que se expande una sola vez cuando el tic termina de dibujarse */
  --halo: rgba(242, 137, 107, 0.45);
  animation: confirmacion-halo 0.9s ease-out 1s 1 both;
}

.confirmacion__icon svg {
  display: block;
}

/* Las longitudes (151 y 34) son lo que mide cada trazo: así se dibujan "de a poco" */
.confirmacion__circulo {
  fill: var(--color-accent-bg);
  stroke: var(--color-accent-dark);
  stroke-width: 2.5;
  stroke-dasharray: 151;
  animation: confirmacion-dibuja-circulo 0.7s ease-out both;
}

.confirmacion__tic {
  stroke: var(--color-accent-dark);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 34;
  animation: confirmacion-dibuja-tic 0.4s ease-out 0.55s both;
}

@keyframes confirmacion-dibuja-circulo {
  from {
    stroke-dashoffset: 151;
    fill-opacity: 0;
  }
}

@keyframes confirmacion-dibuja-tic {
  from {
    stroke-dashoffset: 34;
  }
}

@keyframes confirmacion-halo {
  0% {
    box-shadow: 0 0 0 0 var(--halo);
  }
  100% {
    box-shadow: 0 0 0 18px transparent;
  }
}

/* Las filas del resumen entran una tras otra, después del tic */
.confirmacion__fila {
  animation: confirmacion-fila 0.45s var(--ease-out) both;
  animation-delay: 0.9s;
}

.confirmacion__fila:nth-child(2) {
  animation-delay: 1s;
}

.confirmacion__fila:nth-child(3) {
  animation-delay: 1.1s;
}

.confirmacion__fila:nth-child(4) {
  animation-delay: 1.2s;
}

.confirmacion__fila:nth-child(5) {
  animation-delay: 1.3s;
}

@keyframes confirmacion-fila {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* Quien prefiere menos movimiento lo ve todo ya dibujado y en su sitio */
@media (prefers-reduced-motion: reduce) {
  .confirmacion__icon,
  .confirmacion__circulo,
  .confirmacion__tic,
  .confirmacion__fila {
    animation: none;
  }
}

.confirmacion h1 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.confirmacion__texto {
  color: var(--color-text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirmacion__resumen {
  background-color: var(--color-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.confirmacion__fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  & span {
    color: var(--color-text-muted);
  }
}

.confirmacion__acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;

  & .btn {
    text-decoration: none;
    display: block;
  }
}

@media (max-width: 480px) {
  .confirmacion__box {
    padding: 28px 20px;
  }
}
</style>
