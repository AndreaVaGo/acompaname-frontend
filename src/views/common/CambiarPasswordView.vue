<script setup>
import { ref, nextTick } from "vue";
import UsuarioRepository from "@/repositories/UsuarioRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import {
  validarCambioPassword,
  ORDEN_CAMBIO_PASSWORD,
} from "@/utils/validarCambioPassword";
import { primerCampoConError, hayErrores } from "@/utils/erroresDeCampos";
import CampoPassword from "@/components/CampoPassword.vue";

const passwordActual = ref("");
const passwordNueva = ref("");
const passwordRepetida = ref("");
// Aviso general y errores de cada campo: { campo: "mensaje" }
const error = ref("");
const errores = ref({});
const MENSAJE_REVISAR = "Revisa los campos marcados en rojo.";
// Id del elemento de cada campo, para llevar el cursor al primero con error
const ID_DE_CAMPO = {
  passwordActual: "password-actual",
  passwordNueva: "password-nueva",
  passwordRepetida: "password-repetida",
};
const exito = ref("");

const usuarioRepository = new UsuarioRepository();
const authStore = useAuthStore();

async function llevarElCursorAlPrimerError() {
  const campo = primerCampoConError(errores.value, ORDEN_CAMBIO_PASSWORD);
  await nextTick();
  if (campo) {
    document.getElementById(ID_DE_CAMPO[campo])?.focus();
  }
}

async function handleSubmit() {
  exito.value = "";

  // La contraseña nueva debe cumplir las mismas reglas que en el registro.
  // La actual NO se comprueba: puede ser una contraseña antigua y débil.
  errores.value = validarCambioPassword({
    passwordActual: passwordActual.value,
    passwordNueva: passwordNueva.value,
    passwordRepetida: passwordRepetida.value,
  });
  if (hayErrores(errores.value)) {
    error.value = MENSAJE_REVISAR;
    await llevarElCursorAlPrimerError();
    return;
  }
  error.value = "";

  try {
    await usuarioRepository.cambiarPassword(
      authStore.id,
      passwordActual.value,
      passwordNueva.value,
    );
    exito.value =
      "Contraseña cambiada correctamente. Por seguridad hemos cerrado tu sesión: entra de nuevo con la nueva contraseña.";
    passwordActual.value = "";
    passwordNueva.value = "";
    passwordRepetida.value = "";
    // El servidor cierra todas las sesiones al cambiar la contraseña, así que el token de ahora ya no vale
    authStore.logout();
  } catch (err) {
    // 400: la contraseña actual no es correcta, o la nueva es igual que la actual
    if (err.status === 400) {
      error.value =
        "No se pudo cambiar la contraseña. Revisa que la actual sea correcta y que la nueva sea distinta.";
    } else {
      error.value = mensajeDeError(err, "No se pudo cambiar la contraseña.");
    }
  }
}
</script>

<template>
  <div class="cambiar-password pantalla">
    <div class="cambiar-password__wrapper">
      <h1>Cambiar contraseña</h1>
      <p class="cambiar-password__subtitle">
        Por seguridad, necesitamos tu contraseña actual.
      </p>

      <div class="cambiar-password__box tarjeta-cristal">
        <div class="cambiar-password__cabecera">
          <span class="cambiar-password__icono">🔒</span>
          <span class="cambiar-password__aviso">
            Elige una contraseña que no hayas usado antes.
          </span>
        </div>

        <form
          class="formulario cambiar-password__form"
          @submit.prevent="handleSubmit"
        >
          <p class="formulario__nota">Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
          <h2 class="titulo-seccion" data-icono="🔑">Tu contraseña</h2>

          <label class="obligatorio" for="password-actual">Contraseña actual</label>
          <CampoPassword
            id="password-actual"
            placeholder="••••••"
            :invalido="!!errores.passwordActual"
            descrito-por="error-passwordActual"
            v-model="passwordActual"
          />
          <p v-if="errores.passwordActual" id="error-passwordActual" class="campo-error">{{ errores.passwordActual }}</p>

          <label class="obligatorio" for="password-nueva">Contraseña nueva</label>
          <CampoPassword
            id="password-nueva"
            placeholder="Mínimo 8 caracteres"
            :invalido="!!errores.passwordNueva"
            descrito-por="error-passwordNueva"
            v-model="passwordNueva"
          />
          <p v-if="errores.passwordNueva" id="error-passwordNueva" class="campo-error">{{ errores.passwordNueva }}</p>
          <p class="cambiar-password__ayuda">
            Con mayúscula, minúscula, número y un carácter especial.
          </p>

          <label class="obligatorio" for="password-repetida">Repite la contraseña nueva</label>
          <CampoPassword
            id="password-repetida"
            placeholder="••••••"
            :invalido="!!errores.passwordRepetida"
            descrito-por="error-passwordRepetida"
            v-model="passwordRepetida"
          />
          <p v-if="errores.passwordRepetida" id="error-passwordRepetida" class="campo-error">{{ errores.passwordRepetida }}</p>

          <p role="alert" v-if="error" class="cambiar-password__error">{{ error }}</p>
          <p v-if="exito" class="cambiar-password__exito" role="status">{{ exito }}</p>
          <a v-if="exito" id="ir-al-login" class="btn btn--secondary cambiar-password__login" href="/login">
            Iniciar sesión
          </a>

          <button type="submit" class="btn btn--primary">
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cambiar-password {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.cambiar-password__wrapper {
  max-width: 560px;
  width: 100%;
}

.cambiar-password h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.cambiar-password__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.cambiar-password__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.cambiar-password__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.cambiar-password__box::after {
  display: none;
}

/* Franja de color con el candado y un aviso corto */
.cambiar-password__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.cambiar-password__icono {
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

.cambiar-password__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y título de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.cambiar-password__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }
}

/* Texto pequeño bajo la contraseña nueva con los requisitos */
.cambiar-password__ayuda {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: -8px 0 16px;
}

.cambiar-password__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.cambiar-password__login {
  display: block;
  text-align: center;
  margin-bottom: 12px;
}

.cambiar-password__exito {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

@media (max-width: 768px) {
  .cambiar-password {
    padding: 16px 16px 24px;
  }

  .cambiar-password__cabecera {
    padding: 20px;
  }

  .cambiar-password__form {
    padding: 24px 20px 28px;
  }
}
</style>