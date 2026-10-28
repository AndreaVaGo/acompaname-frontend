<script setup>
import { ref } from "vue";
import UsuarioRepository from "@/repositories/UsuarioRepository";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { mensajePassword } from "@/utils/validarPassword";

const passwordActual = ref("");
const passwordNueva = ref("");
const passwordRepetida = ref("");
const error = ref("");
const exito = ref("");

const usuarioRepository = new UsuarioRepository();
const authStore = useAuthStore();

async function handleSubmit() {
  exito.value = "";

  if (!passwordActual.value || !passwordNueva.value || !passwordRepetida.value) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }

  // La contraseña nueva debe cumplir las mismas reglas que en el registro.
  // La actual NO se comprueba: puede ser una contraseña antigua y débil.
  const mensaje = mensajePassword(passwordNueva.value);
  if (mensaje) {
    error.value = mensaje;
    return;
  }
  if (passwordNueva.value !== passwordRepetida.value) {
    error.value = "Las contraseñas nuevas no coinciden.";
    return;
  }
  error.value = "";

  try {
    await usuarioRepository.cambiarPassword(
      authStore.id,
      passwordActual.value,
      passwordNueva.value,
    );
    // Se guardan las credenciales nuevas para que la sesión siga funcionando
    authStore.actualizarPassword(passwordNueva.value);
    exito.value = "Contraseña cambiada correctamente.";
    passwordActual.value = "";
    passwordNueva.value = "";
    passwordRepetida.value = "";
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
  <div class="cambiar-password">
    <div class="cambiar-password__wrapper">
      <h1>Cambiar contraseña</h1>
      <p class="cambiar-password__subtitle">
        Por seguridad, necesitamos tu contraseña actual.
      </p>

      <div class="cambiar-password__box">
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
          <h2 class="titulo-seccion" data-icono="🔑">Tu contraseña</h2>

          <label for="password-actual">Contraseña actual</label>
          <input
            type="password"
            id="password-actual"
            placeholder="••••••"
            v-model="passwordActual"
          />

          <label for="password-nueva">Contraseña nueva</label>
          <input
            type="password"
            id="password-nueva"
            placeholder="Mínimo 8 caracteres"
            v-model="passwordNueva"
          />
          <p class="cambiar-password__ayuda">
            Con mayúscula, minúscula, número y un carácter especial.
          </p>

          <label for="password-repetida">Repite la contraseña nueva</label>
          <input
            type="password"
            id="password-repetida"
            placeholder="••••••"
            v-model="passwordRepetida"
          />

          <p v-if="error" class="cambiar-password__error">{{ error }}</p>
          <p v-if="exito" class="cambiar-password__exito">{{ exito }}</p>

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
  background-color: var(--color-bg);
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

.cambiar-password__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Franja de color con el candado y un aviso corto */
.cambiar-password__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--color-accent-bg);
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