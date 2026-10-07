<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthRepository from "@/repositories/AuthRepository";
import RoleRepository from "../repositories/RoleRepository";

const rolSeleccionado = ref("familia");
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
    <div class="register__box">
      <h1>Crear cuenta</h1>
      <p class="register__subtitle">
        Solo necesitamos cuatro datos para empezar.
      </p>

      <form class="register__form" @submit.prevent="handleSubmit">
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
          placeholder="Mínimo 6 caracteres"
          v-model="password"
        />

        <label for="telefono">Teléfono</label>
        <input
          type="tel"
          id="telefono"
          placeholder="600 123 456"
          v-model="telefono"
        />

        <label>¿Cómo vas a usar Acompáñame?</label>
        <div class="register__roles">
          <button
            type="button"
            class="register__role"
            :class="{ 'register__role--active': rolSeleccionado === 'familia' }"
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

        <button type="submit" class="btn btn--primary">Crear mi cuenta</button>
      </form>

      <p class="register__switch">
        ¿Ya tienes cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink>
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

.register__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
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
}

.register__role--active {
  border: 2px solid var(--color-accent);
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