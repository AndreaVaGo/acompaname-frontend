<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { claveTurnstile, cargarTurnstile } from "@/utils/captcha";

// Widget del CAPTCHA. Se usa con v-model: guarda el token que da Cloudflare
// (o "" si todavía no se ha resuelto o ha caducado).
// <CaptchaTurnstile ref="captchaRef" v-model="captchaToken" />
defineProps({
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const contenedor = ref(null);
const fallo = ref(false);
let idWidget = null;
let montado = true;

onMounted(async () => {
  try {
    const turnstile = await cargarTurnstile();
    // Si se salió de la pantalla mientras se descargaba, no se dibuja nada
    if (!montado) {
      return;
    }
    idWidget = turnstile.render(contenedor.value, {
      sitekey: claveTurnstile(),
      language: "es",
      callback: (token) => emit("update:modelValue", token),
      "expired-callback": () => emit("update:modelValue", ""),
      "error-callback": () => emit("update:modelValue", ""),
    });
  } catch (error) {
    fallo.value = true;
  }
});

// Un token solo vale una vez: tras un intento (bueno o malo) hay que pedir otro
function reiniciar() {
  emit("update:modelValue", "");
  if (idWidget !== null && window.turnstile) {
    window.turnstile.reset(idWidget);
  }
}

onBeforeUnmount(() => {
  montado = false;
  if (idWidget !== null && window.turnstile) {
    window.turnstile.remove(idWidget);
  }
});

defineExpose({ reiniciar });
</script>

<template>
  <div class="captcha">
    <div ref="contenedor" data-testid="captcha"></div>
    <p v-if="fallo" role="alert" class="captcha__error">
      No se pudo cargar el CAPTCHA. Recarga la página e inténtalo de nuevo.
    </p>
  </div>
</template>

<style scoped>
.captcha {
  margin: 0 0 16px;
}

.captcha__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0;
}
</style>
