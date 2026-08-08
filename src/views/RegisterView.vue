<script setup>
import { ref } from "vue";

const rolSeleccionado = ref("familia");
</script>

<template>
  <div class="register">
    <div class="register__box">
      <h1>Crear cuenta</h1>
      <p class="register__subtitle">
        Solo necesitamos cuatro datos para empezar.
      </p>

      <form class="register__form">
        <label for="nombre">Nombre completo</label>
        <input type="text" id="nombre" placeholder="María López" />

        <label for="email">Email</label>
        <input type="email" id="email" placeholder="nombre@correo.com" />

        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          placeholder="Mínimo 6 caracteres"
        />

        <label for="telefono">Teléfono</label>
        <input type="tel" id="telefono" placeholder="600 123 456" />

        <label>¿Cómo vas a usar Acompáñame?</label>
        <div class="register__roles">
          <button
            type="button"
            class="register__role"
            :class="{ 'register__role--active': rolSeleccionado === 'familia' }"
            @click="rolSeleccionado = 'familia'"
          >
            <span class="register__role-icon">👪</span>
            <span class="register__role-title">Familia</span>
            <span class="register__role-desc">Busco cuidador</span>
          </button>
          <button
            type="button"
            class="register__role"
            :class="{
              'register__role--active': rolSeleccionado === 'cuidador',
            }"
            @click="rolSeleccionado = 'cuidador'"
          >
            <span class="register__role-icon">♥</span>
            <span class="register__role-title">Cuidador</span>
            <span class="register__role-desc">Ofrezco servicios</span>
          </button>
        </div>

        <button type="submit" class="btn btn--primary">Crear mi cuenta</button>
      </form>

      <p class="register__switch">
        ¿Ya tienes cuenta? <a href="#">Iniciar sesión</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 20px;
}

.register__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.register h1 {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.register__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.register__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & input {
    padding: 12px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: var(--gap-md);
    font-size: 1rem;
    font-family: inherit;
  }
}

.register__roles {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: 24px;
}

.register__role {
  flex: 1;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  font-family: inherit;
  position: relative;

  &--active {
    border: 2px solid var(--color-accent);
    background-color: #fff0eb;

    &::after {
      content: "✓";
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: var(--color-accent);
      color: var(--color-white);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }
  }
}

.register__role-icon {
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.register__role-title {
  font-weight: bold;
}

.register__role-desc {
  font-size: 0.85rem;
  color: #666;
}

.register__switch {
  text-align: center;
  margin-top: var(--gap-md);
  font-size: 0.9rem;

  & a {
    color: var(--color-accent);
    font-weight: bold;
    text-decoration: none;
  }
}

@media (max-width: 480px) {
  .register__box {
    padding: 24px;
  }

  .register__roles {
    flex-direction: column;
  }
}
</style>
