<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";

const email = ref("");
const error = ref("");
// El texto que contesta el servidor cuando se ha pedido el enlace
const enviado = ref("");

const authRepository = new AuthRepository();

async function handleSubmit() {
  if (!email.value.trim()) {
    error.value = "Escribe el email con el que te registraste.";
    return;
  }
  error.value = "";

  try {
    enviado.value = await authRepository.olvidePassword(email.value.trim());
  } catch (err) {
    // 400: el email no tiene formato de correo
    if (err.status === 400) {
      error.value = "Revisa el email: no parece un correo válido.";
    } else {
      error.value = mensajeDeError(err, "No se pudo enviar el enlace.");
    }
  }
}
</script>

<template>
  <div class="olvide pantalla">
    <div class="olvide__wrapper">
      <h1>¿Has olvidado tu contraseña?</h1>
      <p class="olvide__subtitle">
        No pasa nada. Te mandamos un enlace para elegir una nueva.
      </p>

      <div class="olvide__box tarjeta-cristal">
        <div class="olvide__cabecera">
          <span class="olvide__icono">✉️</span>
          <span class="olvide__aviso">
            Escribe tu email y revisa tu bandeja de entrada.
          </span>
        </div>

        <!-- Cuando ya se ha pedido el enlace, se enseña el aviso en vez del formulario -->
        <div v-if="enviado" class="olvide__hecho">
          <p class="olvide__exito" role="status">{{ enviado }}</p>
          <p class="olvide__ayuda">
            El enlace dura 60 minutos. Si no lo ves, mira también en la carpeta
            de spam.
          </p>
          <RouterLink to="/login" class="btn btn--primary olvide__volver"
            >Volver a iniciar sesión</RouterLink
          >
        </div>

        <form
          v-else
          class="formulario olvide__form"
          @submit.prevent="handleSubmit"
        >
          <h2 class="titulo-seccion" data-icono="📧">Tu correo</h2>

          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="tu@correo.com"
            v-model="email"
          />

          <p role="alert" v-if="error" class="olvide__error">{{ error }}</p>

          <button type="submit" class="btn btn--primary">Enviar enlace</button>
        </form>
      </div>

      <p v-if="!enviado" class="olvide__switch">
        ¿Ya te acuerdas?
        <RouterLink to="/login">Iniciar sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.olvide {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.olvide__wrapper {
  max-width: 480px;
  width: 100%;
}

.olvide h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.olvide__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.olvide__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.olvide__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.olvide__box::after {
  display: none;
}

.olvide__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.olvide__icono {
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

.olvide__aviso {
  font-weight: bold;
}

.olvide__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }
}

.olvide__hecho {
  padding: 28px 32px 32px;
}

.olvide__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.olvide__exito {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  font-size: 0.95rem;
  padding: 12px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

.olvide__ayuda {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 20px;
}

.olvide__volver {
  display: block;
  text-align: center;
  padding: 14px;
  text-decoration: none;
}

.olvide__switch {
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
  .olvide__switch a:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .olvide {
    padding: 16px 16px 24px;
  }

  .olvide__cabecera {
    padding: 20px;
  }

  .olvide__form,
  .olvide__hecho {
    padding: 24px 20px 28px;
  }
}
</style>
