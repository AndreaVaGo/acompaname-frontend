<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__logo">
        <span class="footer__logo-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
            <path
              d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
            />
            <path d="m18 15-2-2" />
            <path d="m15 18-2-2" />
          </svg>
        </span>
        <span class="footer__logo-text">Acompáñame</span>
      </div>

      <nav class="footer__enlaces">
        <RouterLink to="/aviso-legal" class="footer__enlace">
          Aviso legal
        </RouterLink>
        <RouterLink to="/privacidad" class="footer__enlace">
          Política de privacidad
        </RouterLink>
      </nav>

      <div class="footer__derecha">
        <p class="footer__text">© 2026 Acompáñame — Proyecto Final Bootcamp</p>

        <!-- Enlace externo a mi perfil de GitHub: se abre en otra pestaña -->
        <a
          href="https://github.com/AndreaVaGo"
          class="footer__github"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            />
          </svg>
          AndreaVaGo
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

/* Tres columnas: los extremos miden siempre lo mismo (minmax(0, 1fr)),
   así los enlaces del centro quedan centrados */
.footer__content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 14px 40px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px 32px;
}

/* Solo la marca y el enlace a GitHub destacan; el resto del footer va en peso normal */
.footer__logo {
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text);
}

.footer__logo-icon {
  display: inline-flex;
}

.footer__enlaces {
  justify-self: center;
  display: flex;
  gap: 20px;
}

.footer__enlace {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
}

/* A la derecha: el texto y, a continuación, el enlace a GitHub; si no caben, saltan de línea */
.footer__derecha {
  justify-self: end;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px 20px;
}

.footer__text {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.footer__github,
.footer__github:visited {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

@media (hover: hover) {
  .footer__enlace:hover,
  .footer__github:hover {
    color: var(--color-accent);
  }
}

@media (max-width: 768px) {
  .footer__content {
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 12px 20px;
  }

  .footer__derecha {
    justify-content: center;
  }
}
</style>