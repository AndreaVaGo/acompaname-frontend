<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";

const cuidadorRepository = new CuidadorRepository();
const cuidadores = ref([]);
const busqueda = ref("");
const cargando = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    cuidadores.value = await cuidadorRepository.getAll();
  } catch (err) {
    error.value = "No se pudieron cargar los cuidadores.";
  } finally {
    cargando.value = false;
  }
});

const cuidadoresFiltrados = computed(() => {
  return cuidadores.value.filter(
    (cuidador) =>
      cuidador.usuarioNombre
        .toLowerCase()
        .includes(busqueda.value.toLowerCase()) ||
      cuidador.especialidad
        .toLowerCase()
        .includes(busqueda.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="buscar">
    <header class="buscar__header">
      <h1>Cuidadores disponibles</h1>
      <p>
        Elige el tipo de cuidado que necesitas y mira quién puede acompañaros.
      </p>
    </header>

    <div class="buscar__search">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por nombre o especialidad..."
        class="buscar__input"
      />
      <button class="btn btn--primary">Buscar</button>
    </div>

    <div class="buscar__filters">
      <div class="buscar__filter-group">
        <label>Tipo de cuidado</label>
        <div class="buscar__filter-options">
          <button class="buscar__filter-btn buscar__filter-btn--active">
            Todos
          </button>
          <button class="buscar__filter-btn">Hospitalario</button>
          <button class="buscar__filter-btn">A domicilio</button>
          <button class="buscar__filter-btn">Ambos</button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Disponibilidad</label>
        <div class="buscar__filter-options">
          <button class="buscar__filter-btn buscar__filter-btn--active">
            Cualquier disponibilidad
          </button>
          <button class="buscar__filter-btn">Disponible ahora</button>
        </div>
      </div>

      <div class="buscar__filter-group">
        <label>Vehículo propio</label>
        <div class="buscar__filter-options">
          <button class="buscar__filter-btn buscar__filter-btn--active">
            Indiferente
          </button>
          <button class="buscar__filter-btn">Con vehículo propio</button>
        </div>
      </div>
    </div>

    <p class="buscar__count">
      {{ cuidadoresFiltrados.length }}
      {{ cuidadoresFiltrados.length === 1 ? "cuidador" : "cuidadores" }} para ti
    </p>

    <div class="buscar__grid">
      <div
        class="buscar__card"
        v-for="cuidador in cuidadoresFiltrados"
        :key="cuidador.id"
      >
        <h3>{{ cuidador.usuarioNombre }}</h3>
        <p class="buscar__card-especialidad">{{ cuidador.especialidad }}</p>

        <div class="buscar__tags">
          <span
            class="buscar__tag buscar__tag--disponible"
            v-if="cuidador.disponibleAhora"
            >Disponible ahora</span
          >
          <span
            class="buscar__tag buscar__tag--vehiculo"
            v-if="cuidador.tieneVehiculo"
            >Vehículo propio</span
          >
        </div>

        <div class="buscar__card-footer">
          <span class="buscar__precio">{{ cuidador.tarifaHora }} €/hora</span>
          <RouterLink :to="`/cuidador/${cuidador.id}`" class="btn btn--primary"
            >Ver perfil</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buscar {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.buscar__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.buscar__search {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.buscar__input {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-size: 1rem;
  font-family: inherit;
}

.buscar__filters {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.buscar__filter-group {
  margin-bottom: 16px;

  & label {
    display: block;
    font-weight: bold;
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
}

.buscar__filter-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.buscar__filter-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  color: var(--color-text);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;

  &--active {
    background-color: var(--color-accent);
    color: var(--color-white);
    border-color: var(--color-accent);
  }
}

.buscar__count {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.buscar__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
}

.buscar__card {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-card);

  & h3 {
    margin: 0 0 4px;
  }
}

.buscar__card-especialidad {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.buscar__card-valoracion {
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.buscar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.buscar__tag {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;

  &--cuidado {
    background-color: var(--color-secondary-bg);
    color: var(--color-secondary);
  }

  &--ciudad {
    background-color: var(--color-neutral-bg);
    color: var(--color-text-muted);
  }

  &--disponible {
    background-color: var(--color-accent-bg);
    color: #c65a35;
  }

  &--vehiculo {
    background-color: var(--color-info-bg);
    color: var(--color-info);
  }
}

.buscar__card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 14px;
}

.buscar__precio {
  font-weight: bold;
}

@media (max-width: 900px) {
  .buscar {
    padding: 24px 20px;
  }

  .buscar__grid {
    grid-template-columns: 1fr;
  }

  .buscar__filter-options {
    gap: 8px;
  }

  .buscar__filter-btn {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
}
</style>
