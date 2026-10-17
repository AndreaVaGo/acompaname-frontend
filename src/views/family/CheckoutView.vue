<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PagoRepository from "@/repositories/PagoRepository";

const route = useRoute();
const router = useRouter();
const solicitudId = Number(route.params.id);
const pagoRepository = new PagoRepository();

const pago = ref(null);
const cargando = ref(true);
const numeroTarjeta = ref("");
const nombreTitular = ref("");
const caducidad = ref("");
const cvv = ref("");
const error = ref("");
const procesando = ref(false);
const pagado = ref(false);

onMounted(async () => {
  try {
    const pagos = await pagoRepository.getMisPagos();
    pago.value = pagos.find((p) => p.solicitudId === solicitudId) || null;
    if (!pago.value) {
      error.value = "No se ha encontrado el pago de esta solicitud.";
    }
  } catch (err) {
    error.value = "No se pudo cargar el pago.";
  } finally {
    cargando.value = false;
  }
});

async function pagar() {
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

  try {
    await pagoRepository.marcarComoPagado(pago.value.id);
    pagado.value = true;
  } catch (err) {
    error.value = "No se pudo realizar el pago.";
  } finally {
    procesando.value = false;
  }
}

function verSolicitudes() {
  router.push({ name: "solicitudes" });
}
</script>

<template>
  <div class="checkout">
    <div class="checkout__wrapper">
      <h1>Pago del servicio</h1>
      <p class="checkout__subtitle">
        Pago simulado — no se realiza ningún cargo real.
      </p>

      <div class="checkout__box">
        <p v-if="cargando" class="checkout__cargando">Cargando pago...</p>

        <!-- Franja de color con el importe a pagar -->
        <div v-if="pago && !pagado" class="checkout__cabecera">
          <span class="checkout__icono">💳</span>
          <p class="checkout__importe">
            Importe: <strong>{{ pago.importe }} €</strong>
          </p>
        </div>

        <p v-if="pago && pago.estado === 'COMPLETADO'" class="checkout__info">
          Este servicio ya está pagado.
        </p>

        <div v-if="pagado" class="checkout__exito">
          <p class="checkout__exito-icono">✓</p>
          <h2>¡Pago realizado!</h2>
          <p>
            Hemos registrado tu pago de <strong>{{ pago.importe }} €</strong>.
          </p>
          <button
            type="button"
            class="btn btn--primary"
            @click="verSolicitudes"
          >
            Ver mis solicitudes
          </button>
        </div>

        <form
          v-if="pago && pago.estado !== 'COMPLETADO' && !pagado"
          class="formulario checkout__form"
          @submit.prevent="pagar"
        >
          <h2 class="titulo-seccion" data-icono="🔒">Datos de la tarjeta</h2>

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

        <p v-if="error && !pago" class="checkout__error checkout__error--suelto">
          {{ error }}
        </p>
      </div>
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
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 32px;
}

.checkout__wrapper {
  max-width: 520px;
  width: 100%;
}

.checkout h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.checkout__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

.checkout__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.checkout__cargando {
  padding: 24px 32px;
}

/* Franja de color con el icono y el importe */
.checkout__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--color-accent-bg);
}

.checkout__icono {
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

.checkout__importe {
  font-size: 1.2rem;
  margin: 0;

  & strong {
    font-size: 1.6rem;
  }
}

.checkout__info {
  color: var(--color-secondary);
  font-weight: bold;
  padding: 20px 32px;
  margin: 0;
}

.checkout__exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--gap-sm);
  padding: 32px;

  & h2 {
    font-size: 1.3rem;
    margin: 0;
  }

  & p {
    margin: 0;
  }

  & .btn {
    width: 100%;
    margin-top: 12px;
  }
}

.checkout__exito-icono {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Etiquetas, campos y título de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.checkout__form {
  padding: 28px 32px 32px;

  & .titulo-seccion {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }

  & .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.checkout__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;

  & > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
}

.checkout__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.checkout__error--suelto {
  margin: 24px 32px;
}

@media (max-width: 768px) {
  .checkout {
    padding: 16px 16px 24px;
  }

  .checkout__cabecera {
    padding: 20px;
  }

  .checkout__info {
    padding: 20px;
  }

  .checkout__exito {
    padding: 24px 20px;
  }

  .checkout__form {
    padding: 24px 20px 28px;
  }

  .checkout__error--suelto {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  
  .checkout__row {
    grid-template-columns: 1fr;
  }
}
</style>