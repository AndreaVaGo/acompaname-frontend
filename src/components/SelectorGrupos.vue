<script setup>
import { computed } from "vue";
import { GRUPOS } from "../utils/catalogoGrupos";

// Selector de grupos de edad. Se usa en tres sitios:
// - perfil de la persona cuidadora: se pueden marcar varios (multiple)
// - solicitud de servicio: se elige uno solo
// - buscador: se elige uno solo, o "todos" (textoTodos)
// Con multiple, el valor es una lista de códigos; si no, es un solo código ("" = ninguno / todos).
const props = defineProps({
  modelValue: { type: [Array, String], default: "" },
  multiple: { type: Boolean, default: false },
  // Título del grupo de opciones (lo leen los lectores de pantalla)
  legend: { type: String, required: true },
  // Si se escribe, aparece una primera opción con este texto que deja el valor vacío
  textoTodos: { type: String, default: "" },
  // Las opciones de un mismo selector comparten nombre (necesario para las de elegir una sola)
  name: { type: String, default: "grupo-edad" },
});

const emit = defineEmits(["update:modelValue"]);

// Lo que hay elegido ahora, siempre con la forma correcta (lista o texto)
const seleccion = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return props.modelValue;
});

function marcado(codigo) {
  if (props.multiple) {
    return seleccion.value.includes(codigo);
  }
  return seleccion.value === codigo;
}

function elegir(codigo) {
  if (!props.multiple) {
    emit("update:modelValue", codigo);
    return;
  }

  // Con varias opciones, marcar añade y volver a marcar quita
  if (marcado(codigo)) {
    emit(
      "update:modelValue",
      seleccion.value.filter((elegido) => elegido !== codigo),
    );
  } else {
    emit("update:modelValue", [...seleccion.value, codigo]);
  }
}
</script>

<template>
  <fieldset class="grupos">
    <legend class="grupos__legend">{{ legend }}</legend>
    <div class="grupos__lista">
      <label
        v-if="textoTodos"
        class="grupos__opcion"
        :class="{ 'grupos__opcion--marcada': marcado('') }"
      >
        <input
          type="radio"
          :name="name"
          value=""
          :checked="marcado('')"
          @change="elegir('')"
        />
        <span class="grupos__nombre">{{ textoTodos }}</span>
      </label>

      <label
        v-for="grupo in GRUPOS"
        :key="grupo.codigo"
        class="grupos__opcion"
        :class="{ 'grupos__opcion--marcada': marcado(grupo.codigo) }"
      >
        <input
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :value="grupo.codigo"
          :checked="marcado(grupo.codigo)"
          @change="elegir(grupo.codigo)"
        />
        <span class="grupos__texto">
          <span class="grupos__nombre">{{ grupo.nombre }}</span>
          <span class="grupos__edades">{{ grupo.edades }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.grupos {
  border: none;
  padding: 0;
  margin: 0;
}

.grupos__legend {
  font-weight: bold;
  padding: 0;
  margin-bottom: var(--gap-sm);
}

.grupos__lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--gap-sm);
}

.grupos__opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  background-color: var(--color-white);
  font-weight: normal;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.grupos__opcion:hover,
.grupos__opcion:focus-within {
  border-color: var(--color-accent);
}

.grupos__opcion--marcada {
  border-color: var(--color-accent);
  background-color: var(--color-accent-bg);
}

.grupos__opcion input {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.grupos__texto {
  display: flex;
  flex-direction: column;
}

.grupos__nombre {
  font-size: 0.95rem;
}

.grupos__opcion--marcada .grupos__nombre {
  font-weight: bold;
}

.grupos__edades {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .grupos__opcion {
    transition: none;
  }
}
</style>