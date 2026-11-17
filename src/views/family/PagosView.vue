<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import PagoRepository from "@/repositories/PagoRepository";
import { ordenarPagos, sumarImportes } from "@/utils/resumenPagos";
import { formatearEuros } from "@/utils/formatearEuros";
import { formatearFecha } from "@/utils/formatearFecha";
import { nombreTipo } from "@/utils/nombreTipo";
import { mensajeDeError } from "@/utils/mensajeDeError";

const pagoRepository = new PagoRepository();
const pagos = ref([]);
const cargando = ref(true);
const error = ref("");

// Los pendientes salen arriba; los cancelados no cuentan en ningún total
const pagosOrdenados = computed(() => ordenarPagos(pagos.value));
const totalPagado = computed(() => sumarImportes(pagos.value, "COMPLETADO"));
const totalPendiente = computed(() => sumarImportes(pagos.value, "PENDIENTE"));

// El back usa COMPLETADO, pero para la familia es un pago "Pagado"
const NOMBRES_ESTADO = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Pagado",
  CANCELADO: "Cancelado",
};

function nombreEstado(estado) {
  return NOMBRES_ESTADO[estado] || estado;
}

onMounted(async () => {
  try {
    pagos.value = await pagoRepository.getMisPagos();
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudieron cargar tus pagos.");
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div class="pagos">
    <header class="pagos__header">
      <h1>Mis pagos</h1>
      <p>Todos tus pagos en un solo sitio.</p>
    </header>

    <p v-if="error" class="pagos__error">{{ error }}</p>

    <p v-if="cargando" class="pagos__cargando">Cargando pagos…</p>

    <template v-else-if="!error">
      <div v-if="pagos.length === 0" class="pagos__vacio">
        <p>Todavía no tienes pagos.</p>
        <p>
          Cuando una persona cuidadora complete una solicitud, el pago aparecerá
          aquí.
        </p>
        <RouterLink to="/solicitudes" class="btn btn--primary">
          Ver mis solicitudes
        </RouterLink>
      </div>

      <template v-else>
        <div class="pagos__totales">
          <div class="pagos__total pagos__total--pagado">
            <span class="pagos__total-nombre">Total pagado</span>
            <strong class="pagos__total-importe">{{
              formatearEuros(totalPagado)
            }}</strong>
          </div>
          <div class="pagos__total pagos__total--pendiente">
            <span class="pagos__total-nombre">Pendiente de pagar</span>
            <strong class="pagos__total-importe">{{
              formatearEuros(totalPendiente)
            }}</strong>
          </div>
        </div>

        <ul class="pagos__lista">
          <li
            v-for="pago in pagosOrdenados"
            :key="pago.id"
            class="pagos__tarjeta"
            :class="'pagos__tarjeta--' + pago.estado.toLowerCase()"
          >
            <div class="pagos__datos">
              <h2>{{ pago.cuidadorNombre || "Persona cuidadora" }}</h2>
              <p class="pagos__detalle">
                Solicitud nº {{ pago.solicitudId }} ·
                {{ nombreTipo(pago.tipoCuidado) }} ·
                {{ formatearFecha(pago.fecha) }}
              </p>
            </div>

            <div class="pagos__derecha">
              <span class="pagos__importe">{{
                formatearEuros(pago.importe)
              }}</span>
              <span
                class="pagos__estado"
                :class="'pagos__estado--' + pago.estado.toLowerCase()"
                >{{ nombreEstado(pago.estado) }}</span
              >
              <!-- El pago se hace en la pantalla de pago que ya existe -->
              <RouterLink
                v-if="pago.estado === 'PENDIENTE'"
                :to="`/pagar/${pago.solicitudId}`"
                class="btn btn--primary"
              >
                Pagar
              </RouterLink>
            </div>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
.pagos {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 900px;
  margin: 0 auto;
}

.pagos__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.pagos__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
}

.pagos__cargando {
  color: var(--color-text-muted);
}

/* Mensaje amable cuando todavía no hay ningún pago */
.pagos__vacio {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 32px;
  text-align: center;

  & p {
    margin: 0 0 12px;
  }

  & .btn {
    display: inline-block;
    margin-top: 8px;
    text-decoration: none;
  }
}

.pagos__totales {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-md);
  margin-bottom: var(--gap-md);
}

.pagos__total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding: 20px 24px;
}

.pagos__total--pagado {
  border-top-color: var(--color-secondary);
}

.pagos__total--pendiente {
  border-top-color: var(--color-accent);
}

.pagos__total-nombre {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: bold;
}

.pagos__total-importe {
  font-size: 1.6rem;
}

.pagos__lista {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  list-style: none;
  margin: 0;
  padding: 0;
}

.pagos__tarjeta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 6px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding: 20px 24px 20px 22px;
}

/* El color del borde lateral cambia según el estado del pago */
.pagos__tarjeta--pendiente {
  border-left-color: var(--color-accent);
}

.pagos__tarjeta--completado {
  border-left-color: var(--color-secondary);
}

.pagos__datos h2 {
  margin: 0 0 4px;
  font-size: 1.15rem;
}

.pagos__detalle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.pagos__derecha {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pagos__importe {
  font-size: 1.2rem;
  font-weight: bold;
}

.pagos__estado {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.pagos__estado--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.pagos__estado--completado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.pagos__estado--cancelado {
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .pagos {
    padding: 24px 20px;
  }

  .pagos__totales {
    grid-template-columns: 1fr;
  }

  .pagos__derecha {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
