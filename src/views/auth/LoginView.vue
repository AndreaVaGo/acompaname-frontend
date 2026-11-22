<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import CampoPassword from "@/components/CampoPassword.vue";
import PantallaConFoto from "@/components/PantallaConFoto.vue";
import CaptchaTurnstile from "@/components/CaptchaTurnstile.vue";
import CodigoDosPasos from "@/components/CodigoDosPasos.vue";
import { captchaActivo } from "@/utils/captcha";

const email = ref("");
const password = ref("");
const error = ref("");
// CAPTCHA: solo se muestra y se exige si hay clave de Turnstile configurada
const conCaptcha = captchaActivo();
const captchaToken = ref("");
const captchaRef = ref(null);
// Si la cuenta tiene el segundo paso activado, aquí se guarda el desafío que da el servidor
// y se enseña la pantalla del código en vez del formulario
const desafio = ref("");

const authRepository = new AuthRepository();
const authStore = useAuthStore();
const router = useRouter();

// Guarda la sesión y lleva a la persona a su pantalla
function terminarLogin(data) {
  authStore.login(data.id, data.username, data.token, data.roles);
  // El administrador entra directamente en su panel
  if (data.roles === "ADMIN") {
    router.push("/admin");
  } else {
    router.push("/");
  }
}

// Segundo paso: se comprueba el código que llegó por correo
async function verificarCodigo(codigo) {
  error.value = "";
  try {
    const data = await authRepository.verificarCodigo(desafio.value, codigo);
    terminarLogin(data);
  } catch (err) {
    // 400: el código es incorrecto, ha caducado o se han gastado los intentos
    if (err.status === 400) {
      error.value =
        "El código no es correcto o ha caducado. Si has fallado varias veces, vuelve atrás e inicia sesión otra vez.";
    } else {
      error.value = mensajeDeError(err, "No se pudo comprobar el código.");
    }
  }
}

// Vuelve al formulario. El CAPTCHA ya se gastó, así que hay que resolverlo otra vez
function volverAlLogin() {
  desafio.value = "";
  error.value = "";
  password.value = "";
  captchaToken.value = "";
}

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
    // Con el segundo paso activado todavía no hay token: falta escribir el código del correo
    if (data.requiereCodigo) {
      desafio.value = data.desafio;
      return;
    }
    terminarLogin(data);
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

        <div class="login__box tarjeta-cristal">
          <div class="login__cabecera">
            <span class="login__icono">{{ desafio ? "📬" : "👋" }}</span>
            <span class="login__aviso">
              {{
                desafio
                  ? "Un paso más: escribe el código que te hemos mandado."
                  : "Entra con tu email y tu contraseña."
              }}
            </span>
          </div>

          <!-- El formulario y la pantalla del código se cambian con un deslizamiento -->
          <Transition name="paso" mode="out-in">
          <CodigoDosPasos
            v-if="desafio"
            key="codigo"
            class="login__form"
            :correo="email"
            :error="error"
            @verificar="verificarCodigo"
            @volver="volverAlLogin"
          />
          <form
            v-else
            key="datos"
            class="formulario login__form"
            @submit.prevent="handleSubmit"
          >
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
          </Transition>
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

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.login__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.login__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.login__box::after {
  display: none;
}

/* Franja de color con un saludo y un aviso corto */
.login__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
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

/* Cambio entre el formulario y la pantalla del código: sale hacia un lado y entra desde el otro */
.paso-enter-active,
.paso-leave-active {
  transition:
    opacity var(--dur-med) var(--ease-out),
    translate var(--dur-med) var(--ease-out);
}

.paso-enter-from {
  opacity: 0;
  translate: 24px 0;
}

.paso-leave-to {
  opacity: 0;
  translate: -24px 0;
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