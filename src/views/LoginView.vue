<script setup></script>

<template>
  <div class="login">
    <div class="login__box">
      <div class="login__logo">
        <span class="login__logo-icon">♥</span>
        <span class="login__logo-text">Acompáñame</span>
      </div>

      <h1>Iniciar sesión</h1>
      <p class="login__subtitle">Bienvenida de nuevo. Nos alegra verte por aquí.</p>

      <form class="login__form">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="tu@correo.com" />

        <label for="password">Contraseña</label>
        <input type="password" id="password" placeholder="••••••" />

        <button type="submit" class="btn btn--primary">Entrar</button>
      </form>

      <p class="login__switch">
        ¿Todavía no tienes cuenta? <a href="#">Registrarme</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
}

.login__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.login__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 24px;

  & .login__logo-icon {
    background-color: var(--color-accent-bg);
    border-radius: 50%;
    padding: 8px 10px;
    color: var(--color-accent);
    font-size: 0.9rem;
  }
}

.login h1 {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.login__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.login__form {
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

.login__switch {
  text-align: center;
  margin-top: var(--gap-md);
  font-size: 0.9rem;

  & a {
    color: var(--color-accent);
    font-weight: bold;
    text-decoration: none;
  }
}
</style>