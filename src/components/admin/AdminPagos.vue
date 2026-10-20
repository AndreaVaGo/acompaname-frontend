<script setup>
import { formatearEuros } from "@/utils/formatearEuros";

// Tarjeta «Pagos»: lo que ya se ha cobrado y lo que falta por cobrar
defineProps({
  cobrados: { type: Number, required: true },
  pendientes: { type: Number, required: true },
});
</script>

<template>
  <div class="admin-pagos">
    <h2 class="titulo-seccion">Pagos</h2>

    <div class="admin-pagos__lista">
      <div class="admin-pagos__caja admin-pagos__caja--cobrados">
        <span class="admin-pagos__nombre">Pagados</span>
        <span class="admin-pagos__importe">{{ formatearEuros(cobrados) }}</span>
      </div>
      <div class="admin-pagos__caja admin-pagos__caja--pendientes">
        <span class="admin-pagos__nombre">Pendientes</span>
        <span class="admin-pagos__importe">{{ formatearEuros(pendientes) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-pagos {
  flex: 1 1 280px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-pagos .titulo-seccion {
  margin-top: 0;
}

.admin-pagos__lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-pagos__caja {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  padding: 14px 16px;
}

.admin-pagos__caja--cobrados {
  background-color: var(--color-secondary-bg);
}

.admin-pagos__caja--cobrados .admin-pagos__nombre {
  color: var(--color-secondary);
}

.admin-pagos__caja--pendientes {
  background-color: var(--color-accent-bg);
}

.admin-pagos__caja--pendientes .admin-pagos__nombre {
  color: var(--color-accent-dark);
}

.admin-pagos__nombre {
  font-weight: bold;
}

.admin-pagos__importe {
  font-weight: bold;
}
</style>