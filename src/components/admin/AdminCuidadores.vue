<script setup>
// Tarjeta «Cuidadores mejor valorados»: nombre, nota media y servicios completados
defineProps({
  cuidadores: { type: Array, required: true },
});

// La inicial del nombre se enseña dentro del círculo
function inicial(nombre) {
  return nombre.charAt(0).toUpperCase();
}

// La nota llega con punto (4.8) y se muestra con coma (4,8)
function nota(valor) {
  return String(valor).replace(".", ",");
}

function textoServicios(cantidad) {
  if (cantidad === 1) {
    return "1 servicio completado";
  }
  return `${cantidad} servicios completados`;
}
</script>

<template>
  <div class="admin-cuidadores">
    <h2 class="titulo-seccion">Cuidadores mejor valorados</h2>

    <p v-if="cuidadores.length === 0" class="admin-cuidadores__vacio">
      Todavía no hay cuidadores valorados.
    </p>

    <div v-else class="admin-cuidadores__lista">
      <div
        v-for="cuidador in cuidadores"
        :key="cuidador.id"
        class="admin-cuidadores__fila"
      >
        <span class="admin-cuidadores__inicial">{{ inicial(cuidador.nombre) }}</span>
        <div class="admin-cuidadores__datos">
          <div class="admin-cuidadores__nombre">{{ cuidador.nombre }}</div>
          <div class="admin-cuidadores__detalle">
            {{ nota(cuidador.notaMedia) }} / 5 ·
            {{ textoServicios(cuidador.serviciosCompletados) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-cuidadores {
  flex: 1 1 420px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-cuidadores .titulo-seccion {
  margin-top: 0;
}

.admin-cuidadores__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-cuidadores__lista {
  display: flex;
  flex-direction: column;
}

.admin-cuidadores__fila {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-neutral-bg);
}

.admin-cuidadores__fila:last-child {
  border-bottom: none;
}

.admin-cuidadores__inicial {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-cuidadores__datos {
  flex: 1 1 auto;
  min-width: 0;
}

.admin-cuidadores__nombre {
  font-weight: bold;
}

.admin-cuidadores__detalle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>