<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import ValoracionRepository from "@/repositories/ValoracionRepository";
import { nombreCuidado } from "@/utils/catalogoCuidados";
import { formatearFecha } from "@/utils/formatearFecha";
import { mensajeDeError } from "@/utils/mensajeDeError";

const solicitudRepository = new SolicitudRepository();
const valoracionRepository = new ValoracionRepository();
const historial = ref([]);
const error = ref("");

onMounted(async () => {
  try {
    const todas = await solicitudRepository.getMisSolicitudes();
    const valoraciones = await valoracionRepository.getAll();
    const idsValorados = valoraciones.map((v) => v.solicitudId);

    historial.value = todas
      .filter((s) => s.estado === "COMPLETADA" || s.estado === "RECHAZADA")
      .map((s) => ({
        id: s.id,
        nombre: s.cuidadorNombre,
        paciente: s.nombrePaciente,
        edad: s.edadPaciente,
        tipoCuidado: s.tipoCuidado,
        fechaInicio: s.fechaCuidado,
        fechaFin: s.fechaFin,
        necesidades: s.necesidades || [],
        notas: s.notas,
        direccion: s.direccion,
        estado: s.estado.toLowerCase(),
        valorada: idsValorados.includes(s.id),
      }));
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar tu historial.");
  }
});

function textoEstado(estado) {
  if (estado === "completada") return "Completada";
  if (estado === "rechazada") return "Rechazada";
  return "Pendiente";
}
</script>

<template>
  <div class="historial">
    <header class="historial__header">
      <h1>Historial de solicitudes</h1>
      <p>El estado final de cada acompañamiento que has gestionado.</p>
    </header>

    <p v-if="error" class="historial__error">{{ error }}</p>

    <div class="historial__grid" v-if="historial.length">
      <div
        class="historial__card"
        :class="'historial__card--' + item.estado"
        v-for="item in historial"
        :key="item.id"
      >
        <div class="historial__card-top">
          <h3>{{ item.nombre }}</h3>
          <span
            class="historial__estado"
            :class="'historial__estado--' + item.estado"
          >
            {{ textoEstado(item.estado) }}
          </span>
        </div>

        <p class="historial__paciente">
          {{ item.paciente }} · {{ item.edad }} años
        </p>

        <div class="historial__necesidades" v-if="item.necesidades.length > 0">
          <span
            class="historial__necesidad"
            v-for="codigo in item.necesidades"
            :key="codigo"
          >
            {{ nombreCuidado(codigo) }}
          </span>
        </div>

        <ul class="historial__detalles">
          <li class="historial__tipo">🏠 {{ item.tipoCuidado }}</li>
          <li>
            📅 <strong>Inicio:</strong> {{ formatearFecha(item.fechaInicio) }}
          </li>
          <li v-if="item.fechaFin">
            📅 <strong>Fin:</strong> {{ formatearFecha(item.fechaFin) }}
          </li>
          <li v-if="item.direccion && item.estado === 'completada'">
            📍
            <strong class="historial__direccion">{{ item.direccion }}</strong>
          </li>
          <li v-if="item.notas">📝 {{ item.notas }}</li>
        </ul>

        <div class="historial__footer" v-if="item.estado === 'completada'">
          <span v-if="item.valorada" class="historial__valorado"
            >Valoración enviada ✓</span
          >
          <RouterLink
            v-else
            :to="`/valorar/${item.id}`"
            class="btn btn--primary"
            >Dejar valoración
          </RouterLink>
        </div>
      </div>
    </div>

    <p class="historial__empty" v-else-if="!error">
      Aún no tienes solicitudes en tu historial.
    </p>
  </div>
</template>

<style scoped>
.historial {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.historial__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.historial__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-md);
}

.historial__card {
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
.historial__card--completada {
  border-left-color: var(--color-info);
}

.historial__card--rechazada {
  border-left-color: var(--color-border);
}

@media (hover: hover) {
  .historial__card:hover {
    transform: translateY(-3px);
  }
}

.historial__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  & h3 {
    margin: 0;
    font-size: 1.25rem;
  }
}

.historial__estado {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.historial__estado--completada {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.historial__estado--rechazada {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.historial__paciente {
  color: var(--color-text);
  font-weight: bold;
  margin-bottom: 14px;
}

/* Los datos van dentro de un recuadro; su color depende del estado */
.historial__detalles {
  list-style: none;
  padding: 12px 14px;
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: var(--color-text);
  background-color: var(--color-neutral-bg);
  border-radius: var(--radius-input);

  & li {
    margin-bottom: 6px;
    overflow-wrap: anywhere;
  }

  & li:last-child {
    margin-bottom: 0;
  }
}

.historial__card--completada .historial__detalles {
  background-color: var(--color-info-bg);
}

/* El tipo de cuidado llega en minúsculas del servidor; así sale con la primera en mayúscula */
.historial__tipo {
  font-weight: bold;
  text-transform: capitalize;
}

.historial__footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.historial__valorado {
  color: var(--color-secondary);
  font-weight: bold;
  font-size: 0.9rem;
}

.historial__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
}

.historial__empty {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 40px;
}

.historial__necesidades {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.historial__necesidad {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
}

/* Las etiquetas alternan coral, verde y azul para distinguirse entre sí */
.historial__necesidad:nth-child(3n + 2) {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.historial__necesidad:nth-child(3n + 3) {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

@media (max-width: 768px) {
  .historial {
    padding: 24px 20px;
  }

  .historial__grid {
    grid-template-columns: 1fr;
  }
}
</style>