<script setup></script>

<template>
  <div class="confirmacion">
    <div class="confirmacion__box">
      <div class="confirmacion__icon">✓</div>

      <h1>Solicitud enviada</h1>
      <p class="confirmacion__texto">
        Hemos avisado a <strong>Lucía Ferrer</strong>. Recibirás un aviso en
        cuanto responda, normalmente en menos de 24 horas.
      </p>

      <div class="confirmacion__resumen">
        <div class="confirmacion__fila">
          <span>Tipo de cuidado</span>
          <strong>Hospital y domicilio</strong>
        </div>
        <div class="confirmacion__fila">
          <span>Fecha de inicio</span>
          <strong>21 de agosto de 2026</strong>
        </div>
        <div class="confirmacion__fila">
          <span>Paciente</span>
          <strong>Antonio Serrano, 81 años</strong>
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
