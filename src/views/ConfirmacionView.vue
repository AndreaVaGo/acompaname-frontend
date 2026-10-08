<script setup>
import { ref, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";

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
    error.value = "No se pudieron cargar los datos de la solicitud.";
  }
});
</script>

<template>
  <div class="confirmacion">
    <div class="confirmacion__box">
      <div class="confirmacion__icon">✓</div>

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
          <strong>{{ solicitud.fechaCuidado }}</strong>
        </div>
        <div class="confirmacion__fila">
          <span>Paciente</span>
          <strong>{{ solicitud.nombrePaciente }}, {{ solicitud.edadPaciente }} años</strong>
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
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirmacion__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.confirmacion__icon {
  width: 56px;
  height: 56px;
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 16px;
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
