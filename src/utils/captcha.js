// CAPTCHA de Cloudflare Turnstile.
// La clave PÚBLICA (site key) se pone en VITE_TURNSTILE_SITE_KEY. La secreta vive solo en el back.
// Si la variable está vacía, el CAPTCHA queda desactivado: no se muestra ni se exige.
// Para probar sin cuenta, Cloudflare da una clave que siempre pasa: 1x00000000000000000000AA

const URL_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function claveTurnstile() {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
}

export function captchaActivo() {
  return claveTurnstile() !== "";
}

// Para no descargar el script dos veces si se abren el login y el registro
let promesaScript = null;

// Descarga el script de Cloudflare (solo la primera vez) y devuelve el objeto "turnstile"
export function cargarTurnstile() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  if (promesaScript) {
    return promesaScript;
  }

  promesaScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = URL_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      // Se olvida el intento fallido para poder volver a intentarlo
      promesaScript = null;
      reject(new Error("No se pudo cargar el CAPTCHA"));
    };
    document.head.appendChild(script);
  });
  return promesaScript;
}
