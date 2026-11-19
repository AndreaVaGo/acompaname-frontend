<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import CampoPassword from "@/components/CampoPassword.vue";
import PantallaConFoto from "@/components/PantallaConFoto.vue";
import CaptchaTurnstile from "@/components/CaptchaTurnstile.vue";
import { captchaActivo } from "@/utils/captcha";

const email = ref("");
const password = ref("");
const error = ref("");
// CAPTCHA: solo se muestra y se exige si hay clave de Turnstile configurada
const conCaptcha = captchaActivo();
const captchaToken = ref("");
const captchaRef = ref(null);

const authRepository = new AuthRepository();
const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  if (!email.value || !password.value) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }
  if (conCaptcha && !captchaToken.value) {
    error.value = "Completa el CAPTCHA para continuar.";
    return;
  }
  error.value = "";

  try {
    const data = conCaptcha
      ? await authRepository.login(email.value, password.value, captchaToken.value)
      : await authRepository.login(email.value, password.value);
    authStore.login(data.id, data.username, data.token, data.roles);
    // El administrador entra directamente en su panel
    if (data.roles === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (err) {
    // El token del CAPTCHA ya se ha usado: se pide uno nuevo
    captchaRef.value?.reiniciar();
    // 401: el servidor no reconoce el email o la contraseña, o la cuenta está bloqueada
    if (err.status === 401) {
      error.value = "Email o contraseña incorrectos, o tu cuenta está bloqueada.";
    } else {
      error.value = mensajeDeError(err, "No se pudo iniciar sesión.");
    }
  }
}
</script>

<template>
  <PantallaConFoto>
    <div class="login">
      <div class="login__wrapper">
        <h1>Iniciar sesión</h1>
        <p class="login__subtitle">
          Bienvenida de nuevo. Nos alegra verte por aquí.
        </p>

        <div class="login__box">
          <div class="login__cabecera">
            <span class="login__icono">👋</span>
            <span class="login__aviso">
              Entra con tu email y tu contraseña.
            </span>
          </div>

          <form class="formulario login__form" @submit.prevent="handleSubmit">
            <h2 class="titulo-seccion" data-icono="🔑">Tus datos de acceso</h2>

            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="tu@correo.com"
              v-model="email"
            />

            <label for="password">Contraseña</label>
            <CampoPassword
              id="password"
              placeholder="••••••"
              v-model="password"
            />

            <p class="login__olvide">
              <RouterLink to="/olvide-password">¿Has olvidado tu contraseña?</RouterLink>
            </p>

            <CaptchaTurnstile
              v-if="conCaptcha"
              ref="captchaRef"
              v-model="captchaToken"
            />

            <p role="alert" v-if="error" class="login__error">{{ error }}</p>

            <button type="submit" class="btn btn--primary">Entrar</button>
          </form>
        </div>

        <p class="login__switch">
          ¿Todavía no tienes cuenta?
          <RouterLink to="/registro">Registrarme</RouterLink>
        </p>
      </div>
    </div>
  </PantallaConFoto>
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
  max-width: 480px;
  width: 100%;
}

.login h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.login__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

.login__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Franja de color con un saludo y un aviso corto */
.login__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--color-accent-bg);
}

.login__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-white);
  font-size: 1.8rem;
}

.login__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y título de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.login__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }
}

.login__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

/* Enlace pequeño bajo la contraseña */
.login__olvide {
  margin: -8px 0 16px;
  font-size: 0.9rem;
  text-align: right;

  & a {
    color: var(--color-accent-dark);
    text-decoration: none;
  }
}

@media (hover: hover) {
  .login__olvide a:hover {
    text-decoration: underline;
  }
}

.login__switch {
  text-align: center;
  margin-top: 20px;
  font-size: 0.95rem;

  & a {
    color: var(--color-accent-dark);
    font-weight: bold;
    text-decoration: none;
  }
}

@media (hover: hover) {
  .login__switch a:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .login {
    padding: 16px 16px 24px;
  }

  .login__cabecera {
    padding: 20px;
  }

  .login__form {
    padding: 24px 20px 28px;
  }
}
</style>