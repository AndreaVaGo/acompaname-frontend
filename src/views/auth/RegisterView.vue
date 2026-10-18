<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import RoleRepository from "../../repositories/RoleRepository";

const route = useRoute();
// Si la dirección trae ?rol=cuidador, ese rol ya viene marcado
const rolInicial = route.query.rol === "cuidador" ? "cuidador" : "familia";

const rolSeleccionado = ref(rolInicial);
const nombre = ref("");
const email = ref("");
const password = ref("");
const telefono = ref("");
const error = ref("");

const authRepository = new AuthRepository();
const router = useRouter();
const roleRepository = new RoleRepository();
const rolesDisponibles = ref([]);

onMounted(async () => {
  rolesDisponibles.value = await roleRepository.getAll();
});

async function handleSubmit() {
  if (!nombre.value || !email.value || !password.value || !telefono.value) {
    error.value = "Por favor, rellena todos los campos.";
    return;
  }
  error.value = "";

  try {
    await authRepository.register({
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
      rolesIds: [
        rolesDisponibles.value.find(
          (r) => r.name === rolSeleccionado.value.toUpperCase(),
        )?.id,
      ],
    });
    router.push("/login");
  } catch (err) {
    error.value = "No se pudo completar el registro. Revisa los datos.";
  }
}
</script>

<template>
  <div class="register">
    <div class="register__wrapper">
      <h1>Crear cuenta</h1>
      <p class="register__subtitle">
        Solo necesitamos cuatro datos para empezar.
      </p>

      <div class="register__box">
        <div class="register__cabecera">
          <span class="register__icono">🌱</span>
          <span class="register__aviso">
            Crea tu cuenta en un minuto.
          </span>
        </div>

        <form
          class="formulario register__form"
          @submit.prevent="handleSubmit"
        >
          <h2 class="titulo-seccion" data-icono="👤">Tus datos</h2>

          <label for="nombre">Nombre completo</label>
          <input
            type="text"
            id="nombre"
            placeholder="María López"
            v-model="nombre"
          />

          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="nombre@correo.com"
            v-model="email"
          />

          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Mínimo 8 caracteres"
            v-model="password"
          />

          <label for="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            placeholder="600 123 456"
            v-model="telefono"
          />

          <h2 class="titulo-seccion" data-icono="🧭">
            ¿Cómo vas a usar Acompáñame?
          </h2>
          <div class="register__roles">
            <button
              type="button"
              class="register__role"
              :class="{
                'register__role--active': rolSeleccionado === 'familia',
              }"
              @click="rolSeleccionado = 'familia'"
            >
              <span class="register__role-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-accent)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
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
              <span class="register__role-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-accent)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                  />
                  <path
                    d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
                  />
                  <path d="m18 15-2-2" />
                  <path d="m15 18-2-2" />
                </svg>
              </span>
              <span class="register__role-title">Cuidador</span>
              <span class="register__role-desc">Ofrezco servicios</span>
            </button>
          </div>

          <p v-if="error" class="register__error">{{ error }}</p>

          <button type="submit" class="btn btn--primary">
            Crear mi cuenta
          </button>
        </form>
      </div>

      <p class="register__switch">
        ¿Ya tienes cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register {
  background-color: var(--color-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 24px 20px 32px;
}

.register__wrapper {
  max-width: 520px;
  width: 100%;
}

.register h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.register__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

.register__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Franja de color con un icono y un aviso corto */
.register__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--color-accent-bg);
}

.register__icono {
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

.register__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y títulos de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.register__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .titulo-seccion:nth-of-type(2) {
    margin-top: 12px;
  }

  & .btn {
    padding: 14px;
  }
}

.register__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.register__roles {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: 20px;
}

.register__role {
  flex: 1;
  background-color: var(--color-white);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  color: var(--color-text);
  text-align: left;
  position: relative;
}

.register__role--active {
  border-color: var(--color-accent);
  background-color: var(--color-accent-bg);
}

.register__role-icon {
  display: inline-flex;
  margin-bottom: 8px;
}

.register__role-title {
  font-weight: bold;
}

.register__role-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media (hover: hover) {
  .register__role:hover {
    border-color: var(--color-accent);
  }

  .register__switch a:hover {
    text-decoration: underline;
  }
}

.register__switch {
  text-align: center;
  margin-top: 20px;
  font-size: 0.95rem;

  & a {
    color: var(--color-accent-dark);
    font-weight: bold;
    text-decoration: none;
  }
}

@media (max-width: 768px) {
  .register {
    padding: 16px 16px 24px;
  }

  .register__cabecera {
    padding: 20px;
  }

  .register__form {
    padding: 24px 20px 28px;
  }
}

@media (max-width: 480px) {
  .register__roles {
    flex-direction: column;
  }
}
</style>