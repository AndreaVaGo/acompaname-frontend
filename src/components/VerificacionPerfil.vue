<script setup>
import { ref, onMounted } from "vue";
import VerificacionRepository from "@/repositories/VerificacionRepository";
import {
  TIPOS_VERIFICACION,
  nombreEstadoVerificacion,
} from "@/utils/catalogoVerificaciones";
import { mensajeDeError } from "@/utils/mensajeDeError";

// Bloque de "Editar perfil" para demostrar la titulación y los antecedentes.
// La persona solo escribe una referencia: un administrador la comprueba y, si está bien,
// las familias ven una insignia "verificado". No se sube ningún documento.
const repository = new VerificacionRepository();

// Lo que ya ha enviado, por tipo: { TITULACION: {...}, ANTECEDENTES: {...} }
const enviadas = ref({});
const referencias = ref({ TITULACION: "", ANTECEDENTES: "" });
const errores = ref({});
const avisos = ref({});
const enviando = ref("");
// Si no se pueden consultar, el bloque no se enseña
const disponible = ref(false);

onMounted(async () => {
  try {
    const lista = await repository.getMias();
    const porTipo = {};
    for (const v of lista) {
      porTipo[v.tipo] = v;
    }
    enviadas.value = porTipo;
    disponible.value = true;
  } catch {
    // Sin perfil creado todavía (o sin conexión) no se puede enviar nada
    disponible.value = false;
  }
});

async function enviar(tipo) {
  const referencia = referencias.value[tipo].trim();
  errores.value = { ...errores.value, [tipo]: "" };
  avisos.value = { ...avisos.value, [tipo]: "" };
  if (!referencia) {
    errores.value = { ...errores.value, [tipo]: "Escribe la referencia antes de enviarla." };
    return;
  }
  enviando.value = tipo;
  try {
    const respuesta = await repository.enviar(tipo, referencia);
    enviadas.value = { ...enviadas.value, [tipo]: respuesta };
    referencias.value = { ...referencias.value, [tipo]: "" };
    avisos.value = {
      ...avisos.value,
      [tipo]: "Enviado. Un administrador la revisará pronto.",
    };
  } catch (err) {
    errores.value = {
      ...errores.value,
      [tipo]: mensajeDeError(err, "No se pudo enviar. Inténtalo de nuevo."),
    };
  } finally {
    enviando.value = "";
  }
}
</script>

<template>
  <section class="verif" v-if="disponible" data-testid="verificacion-perfil">
    <h2 class="verif__titulo">Verifica tu perfil</h2>
    <p class="verif__intro">
      Las familias se fían más de quien ha demostrado su formación. Escribe la
      referencia, la revisamos y tu perfil mostrará una insignia
      <strong>verificado</strong>.
    </p>

    <div class="verif__bloque" v-for="tipo in TIPOS_VERIFICACION" :key="tipo.codigo">
      <div class="verif__cabecera">
        <h3>{{ tipo.nombre }}</h3>
        <span
          v-if="enviadas[tipo.codigo]"
          class="verif__estado"
          :class="'verif__estado--' + enviadas[tipo.codigo].estado.toLowerCase()"
          :data-testid="'estado-' + tipo.codigo"
        >
          {{ nombreEstadoVerificacion(enviadas[tipo.codigo].estado) }}
        </span>
        <span v-else class="verif__estado verif__estado--sin" :data-testid="'estado-' + tipo.codigo">
          Sin verificar
        </span>
      </div>
      <p class="verif__ayuda">{{ tipo.ayuda }}</p>

      <p
        v-if="enviadas[tipo.codigo] && enviadas[tipo.codigo].estado === 'RECHAZADO'"
        class="verif__motivo"
        role="status"
      >
        No se pudo comprobar<span v-if="enviadas[tipo.codigo].motivoRechazo">:
          {{ enviadas[tipo.codigo].motivoRechazo }}</span>. Puedes volver a enviarla.
      </p>

      <template
        v-if="!enviadas[tipo.codigo] || enviadas[tipo.codigo].estado !== 'VERIFICADO'"
      >
        <label :for="'verif-' + tipo.codigo">{{ tipo.etiqueta }}</label>
        <input
          type="text"
          :id="'verif-' + tipo.codigo"
          v-model="referencias[tipo.codigo]"
          maxlength="100"
          :placeholder="tipo.placeholder"
          @keydown.enter.prevent="enviar(tipo.codigo)"
        />
        <p role="alert" v-if="errores[tipo.codigo]" class="verif__error">
          {{ errores[tipo.codigo] }}
        </p>
        <p role="status" v-if="avisos[tipo.codigo]" class="verif__aviso">
          {{ avisos[tipo.codigo] }}
        </p>
        <button
          type="button"
          class="btn btn--secondary verif__boton"
          :disabled="enviando === tipo.codigo"
          :data-testid="'enviar-' + tipo.codigo"
          @click="enviar(tipo.codigo)"
        >
          {{ enviadas[tipo.codigo] ? "Volver a enviar" : "Enviar para revisar" }}
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.verif {
  margin-top: 8px;
}

.verif__titulo {
  margin-bottom: 4px;
}

.verif__intro {
  color: var(--color-text-muted);
  margin: 0 0 14px;
}

.verif__bloque {
  background-color: var(--color-bg);
  border: 1px solid var(--color-neutral-bg);
  border-radius: var(--radius-input);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.verif__cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.verif__cabecera h3 {
  margin: 0;
  font-size: 1rem;
}

.verif__ayuda {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 6px 0 10px;
}

.verif__estado {
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: var(--color-neutral-bg);
  color: var(--color-text-muted);
}

.verif__estado--pendiente {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.verif__estado--verificado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.verif__estado--rechazado {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.verif__motivo,
.verif__error {
  color: var(--color-accent-dark);
  font-size: 0.9rem;
}

.verif__aviso {
  color: var(--color-secondary);
  font-size: 0.9rem;
}

.verif__boton {
  margin-top: 8px;
}
</style>
