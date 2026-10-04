<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const solicitudId = route.params.id;

const numeroTarjeta = ref("");
const nombreTitular = ref("");
const caducidad = ref("");
const cvv = ref("");
const error = ref("");
const procesando = ref(false);

function pagar() {
  if (
    !numeroTarjeta.value ||
    !nombreTitular.value ||
    !caducidad.value ||
    !cvv.value
  ) {
    error.value = "Por favor, rellena todos los campos de la tarjeta.";
    return;
  }
  error.value = "";
  procesando.value = true;

  setTimeout(() => {
    procesando.value = false;
    router.push({ name: "solicitudes" });
  }, 1500);
}
</script>

<template>
  <div class="checkout">
    <div class="checkout__box">
      <h1>Pago del servicio</h1>
      <p class="checkout__subtitle">
        Pago simulado — no se realiza ningún cargo real.
      </p>

      <form class="checkout__form" @submit.prevent="pagar">
        <label for="numero">Número de tarjeta</label>
        <input
          type="text"
          id="numero"
          v-model="numeroTarjeta"
          placeholder="4242 4242 4242 4242"
          maxlength="19"
        />

        <label for="nombre">Nombre del titular</label>
        <input
          type="text"
          id="nombre"
          v-model="nombreTitular"
          placeholder="Andrea Vallina"
        />

        <div class="checkout__row">
          <div>
            <label for="caducidad">Caducidad</label>
            <input
              type="text"
              id="caducidad"
              v-model="caducidad"
              placeholder="MM/AA"
              maxlength="5"
            />
          </div>
          <div>
            <label for="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              v-model="cvv"
              placeholder="123"
              maxlength="3"
            />
          </div>
        </div>

        <p v-if="error" class="checkout__error">{{ error }}</p>

        <button type="submit" class="btn btn--primary" :disabled="procesando">
          {{ procesando ? "Procesando..." : "Pagar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.checkout {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.checkout__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.checkout h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.checkout__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.checkout__form {
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

.checkout__row {
  display: flex;
  gap: var(--gap-sm);

  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.checkout__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

@media (max-width: 480px) {
  .checkout__box {
    padding: 24px;
  }

  .checkout__row {
    flex-direction: column;
  }
}
</style>
