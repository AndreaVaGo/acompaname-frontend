<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import { useAuthStore } from "@/stores/auth";

const email = ref("");
const password = ref("");
const error = ref("");

const authRepository = new AuthRepository();
const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  if (!email.value || !password.value) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }
  error.value = "";

  try {
    const data = await authRepository.login(email.value, password.value);
    authStore.login(data.id, data.username, password.value, data.roles);
    router.push("/");
  } catch (err) {
    error.value = "Email o contraseña incorrectos.";
  }
}
</script>

<template>
  <div class="login">
    <div class="login__wrapper">
      <h1>Iniciar sesión</h1>
      <p class="login__subtitle">
        Bienvenida de nuevo. Nos alegra verte por aquí.
      </p>

      <div class="login__box">
        <form class="login__form" @submit.prevent="handleSubmit">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="tu@correo.com"
            v-model="email"
          />

          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="••••••"
            v-model="password"
          />

          <p v-if="error" class="login__error">{{ error }}</p>

          <button type="submit" class="btn btn--primary">Entrar</button>
        </form>
      </div>

      <p class="login__switch">
        ¿Todavía no tienes cuenta?
        <RouterLink to="/registro">Registrarme</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  background-color: var(--color-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.login__wrapper {
  max-width: 420px;
  width: 100%;
}

.login h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.login__subtitle {
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

.login__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
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
    padding: 10px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: 14px;
    font-size: 1rem;
    font-family: inherit;
  }
}

.login__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.login__switch {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;

  & a {
    color: var(--color-accent);
    font-weight: bold;
    text-decoration: none;
  }
}

@media (max-width: 480px) {
  .login {
    padding: 16px 16px 24px;
  }

  .login__box {
    padding: 18px;
  }
}
</style>