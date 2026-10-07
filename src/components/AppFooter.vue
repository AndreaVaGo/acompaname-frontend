<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__logo">
        <span class="footer__logo-icon">♥</span>
        <span class="footer__logo-text">Acompáñame</span>
      </div>
      <p class="footer__text">© 2026 Acompáñame — Proyecto Final Bootcamp</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.footer__content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text);
}

.footer__logo-icon {
  color: var(--color-accent);
}

.footer__text {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .footer__content {
    flex-direction: column;
    text-align: center;
  }
}
</style>