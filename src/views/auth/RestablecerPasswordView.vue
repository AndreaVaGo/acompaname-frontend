<script setup>
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { mensajePassword } from "@/utils/validarPassword";
import CampoPassword from "@/components/CampoPassword.vue";

const route = useRoute();

// El token viene en el enlace del correo: /restablecer-password?token=...
const token = ref("");
if (typeof route.query.token === "string") {
  token.value = route.query.token;
}

const passwordNueva = ref("");
const passwordRepetida = ref("");
const error = ref("");
const hecho = ref(false);

const authRepository = new AuthRepository();

async function handleSubmit() {
  if (!passwordNueva.value || !passwordRepetida.value) {
    error.value = "Por favor, rellena los dos campos.";
    return;
  }

  // Mismas reglas que en el registro
  const mensaje = mensajePassword(passwordNueva.value);
  if (mensaje) {
    error.value = mensaje;
    return;
  }
  if (passwordNueva.value !== passwordRepetida.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }
  error.value = "";

  try {
    await authRepository.restablecerPassword(token.value, passwordNueva.value);
    passwordNueva.value = "";
    passwordRepetida.value = "";
    hecho.value = true;
  } catch (err) {
    // 400: el servidor explica el motivo (enlace caducado o usado, o contraseña igual a la actual)
    if (err.status === 400 && err.detalle) {
      error.value = err.detalle;
    } else {
      error.value = mensajeDeError(err, "No se pudo cambiar la contraseña.");
    }
  }
}
</script>

<template>
  <div class="restablecer pantalla">
    <div class="restablecer__wrapper">
      <h1>Elige una contraseña nueva</h1>
      <p class="restablecer__subtitle">
        Es el último paso para volver a entrar.
      </p>

      <div class="restablecer__box tarjeta-cristal">
        <div class="restablecer__cabecera">
          <span class="restablecer__icono">🔒</span>
          <span class="restablecer__aviso">
            Elige una contraseña que no hayas usado antes.
          </span>
        </div>

        <!-- Sin token en la dirección, el enlace está incompleto -->
        <div v-if="!token" class="restablecer__hecho">
          <p class="restablecer__error" role="alert">
            Este enlace no está completo. Pide uno nuevo desde el login.
          </p>
          <RouterLink
            to="/olvide-password"
            class="btn btn--primary restablecer__volver"
            >Pedir un enlace nuevo</RouterLink
          >
        </div>

        <div v-else-if="hecho" class="restablecer__hecho">
          <p class="restablecer__exito" role="status">
            Contraseña cambiada correctamente. Ya puedes entrar con la nueva.
          </p>
          <RouterLink to="/login" class="btn btn--primary restablecer__volver"
            >Iniciar sesión</RouterLink
          >
        </div>

        <form
          v-else
          class="formulario restablecer__form"
          @submit.prevent="handleSubmit"
        >
          <p class="formulario__nota">Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
          <h2 class="titulo-seccion" data-icono="🔑">Tu contraseña nueva</h2>

          <label class="obligatorio" for="password-nueva">Contraseña nueva</label>
          <CampoPassword
            id="password-nueva"
            placeholder="Mínimo 8 caracteres"
            v-model="passwordNueva"
          />
          <p class="restablecer__ayuda">
            Con mayúscula, minúscula, número y un carácter especial.
          </p>

          <label class="obligatorio" for="password-repetida">Repite la contraseña</label>
          <CampoPassword
            id="password-repetida"
            placeholder="••••••"
            v-model="passwordRepetida"
          />

          <p role="alert" v-if="error" class="restablecer__error">{{ error }}</p>

          <button type="submit" class="btn btn--primary">
            Cambiar contraseña
          </button>
        </form>
      </div>

      <p v-if="token && !hecho" class="restablecer__switch">
        ¿El enlace ha caducado?
        <RouterLink to="/olvide-password">Pedir uno nuevo</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.restablecer {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.restablecer__wrapper {
  max-width: 480px;
  width: 100%;
}

.restablecer h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.restablecer__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.restablecer__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.restablecer__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.restablecer__box::after {
  display: none;
}

.restablecer__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.restablecer__icono {
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

.restablecer__aviso {
  font-weight: bold;
}

.restablecer__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }
}

.restablecer__hecho {
  padding: 28px 32px 32px;
}

.restablecer__ayuda {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: -8px 0 16px;
}

.restablecer__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.restablecer__exito {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  font-size: 0.95rem;
  padding: 12px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

.restablecer__volver {
  display: block;
  text-align: center;
  padding: 14px;
  text-decoration: none;
}

.restablecer__switch {
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
  .restablecer__switch a:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .restablecer {
    padding: 16px 16px 24px;
  }

  .restablecer__cabecera {
    padding: 20px;
  }

  .restablecer__form,
  .restablecer__hecho {
    padding: 24px 20px 28px;
  }
}
</style>
