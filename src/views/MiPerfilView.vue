<script setup>
const usuario = {
  nombre: "María López",
  email: "maria@correo.com",
  telefono: "600 123 456",
  tipo: "Familia",
};
</script>

<template>
  <div class="mi-perfil">
    <h1>Mi perfil</h1>
    <p class="mi-perfil__subtitle">Los datos de contacto de tu familia.</p>

    <div class="mi-perfil__box">
      <div class="mi-perfil__fila">
        <span>Nombre</span>
        <strong>{{ usuario.nombre }}</strong>
      </div>
      <div class="mi-perfil__fila">
        <span>Email</span>
        <strong>{{ usuario.email }}</strong>
      </div>
      <div class="mi-perfil__fila">
        <span>Teléfono</span>
        <strong>{{ usuario.telefono }}</strong>
      </div>
      <div class="mi-perfil__fila">
        <span>Tipo de cuenta</span>
        <strong>{{ usuario.tipo }}</strong>
      </div>

      <button class="btn btn--secondary">Cerrar sesión</button>
    </div>
  </div>
</template>

<style scoped>
.mi-perfil {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 500px;
  margin: 0 auto;

  & h1 {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
}

.mi-perfil__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.mi-perfil__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.mi-perfil__fila {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;

  & span {
    color: var(--color-text-muted);
  }
}

.mi-perfil__box .btn {
  margin-top: 20px;
  width: 100%;
}

@media (max-width: 480px) {
  .mi-perfil {
    padding: 24px 20px;
  }

  .mi-perfil__box {
    padding: 20px;
  }
}
</style>
