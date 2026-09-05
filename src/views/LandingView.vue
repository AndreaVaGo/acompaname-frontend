<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="landing">
    <section class="landing__hero">
      <div class="landing__hero-content">
        <span class="landing__badge">
          <span class="landing__badge-icon">♥</span>
          Nunca sola, nunca solo
        </span>
        <h1>Cuidadores de confianza, cuando tu familia más lo necesita</h1>
        <p class="landing__hero-text">
          Encuentra profesionales para acompañar a personas dependientes en el
          hospital o en casa. Sin llamadas interminables ni papeleo.
        </p>
        <div class="landing__hero-actions">
          <RouterLink to="/registro" class="btn btn--primary"
            >Registrarme</RouterLink
          >
          <RouterLink to="/login" class="btn btn--secondary"
            >Iniciar sesión</RouterLink
          >
        </div>
        <RouterLink to="/buscar" class="landing__link landing__link--view">
          ¿Solo quieres mirar? Ver cuidadores disponibles
        </RouterLink>
      </div>
      <div class="landing__hero-image">
        <img
          src="../assets/hero.jpg"
          alt="Cuidadora acompañando a una persona mayor"
        />
      </div>
    </section>

    <hr class="landing__divider" />

    <section class="landing__steps">
      <h2>Así de sencillo</h2>
      <div class="landing__steps-grid">
        <div class="landing__step-card">
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
            </svg>
          </span>
          <h3>1. Cuéntanos qué necesitas</h3>
          <p>Hospital, domicilio o ambos. En un minuto.</p>
        </div>
        <div class="landing__step-card">
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path
                d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6z"
              />
            </svg>
          </span>
          <h3>2. Elige a la persona</h3>
          <p>Perfiles con experiencia, tarifa y valoraciones reales.</p>
        </div>
        <div class="landing__step-card">
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path d="M4 4h16v9c0 5-4 7-8 8-4-1-8-3-8-8V4z" />
            </svg>
          </span>
          <h3>3. Solicita y acompaña</h3>
          <p>El cuidador acepta y os coordináis desde la app.</p>
        </div>
      </div>
    </section>

    <hr class="landing__divider" />

    <section class="landing__cta">
      <div class="landing__cta-icon">🏠</div>
      <h2>¿Eres cuidador o cuidadora profesional?</h2>
      <p>
        Publica tu perfil, recibe solicitudes de familias cercanas y gestiona tu
        agenda desde un único sitio.
      </p>
      <RouterLink to="/registro" class="btn btn--primary"
        >Crear mi perfil de cuidador</RouterLink
      >
    </section>

    <hr class="landing__divider" />

    <footer class="landing__footer">
      <div class="landing__logo">
        <span class="landing__logo-icon">♥</span>
        <span class="landing__logo-text">Acompáñame</span>
      </div>
      <p>Acompáñame · Nunca sola, nunca solo · 2026</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  font-family: var(--font-base);
  color: var(--color-text);
  background-color: var(--color-bg);

  & h1,
  & h2,
  & h3 {
    margin: 0;
  }
}

.landing__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.2rem;

  & .landing__logo-icon {
    background-color: var(--color-accent-bg);
    border-radius: 50%;
    padding: 8px 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent);
    font-size: 0.9rem;
  }
}

.btn {
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;

  &--primary {
    background-color: var(--color-accent);
    color: var(--color-white);
  }

  &--secondary {
    background-color: var(--color-white);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
}

.landing__link {
  text-decoration: none;

  &--view {
    color: var(--color-accent);
    font-size: 0.9rem;
  }
}

.landing__hero {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 50px;
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.landing__hero-content {
  max-width: 650px;
  flex-shrink: 0;
}

.landing__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  margin-bottom: 16px;

  & .landing__badge-icon {
    color: var(--color-secondary);
  }
}

.landing__hero h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 16px;
}

.landing__hero-text {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.landing__hero-actions {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: 12px;
}

.landing__hero-image img {
  max-width: 480px;
  width: 100%;
  border-radius: var(--radius-card);
  object-fit: cover;
}

.landing__divider {
  border: none;
  border-top: 1px solid var(--color-secondary-bg);
  margin: 0 60px;
}

.landing__steps {
  text-align: center;
  padding: var(--gap-lg) 60px;

  & h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
}

.landing__steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
  max-width: 900px;
  margin: 0 auto;
}

.landing__step-card {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--gap-md);
  box-shadow: var(--shadow-card);
  text-align: left;

  & h3 {
    margin-bottom: 6px;
  }
}

.landing__step-icon {
  background-color: var(--color-accent-bg);
  border-radius: 50%;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.landing__cta {
  background-color: var(--color-white);
  max-width: 600px;
  margin: 32px auto;
  padding: 32px;
  border-radius: var(--radius-card);
  text-align: center;
  box-shadow: var(--shadow-card);

  & h2 {
    margin-bottom: 12px;
  }
}

.landing__cta-icon {
  background-color: var(--color-secondary-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  margin-bottom: 12px;
  font-size: 1.3rem;
}

.landing__footer {
  text-align: center;
  padding: 28px 20px;

  & .landing__logo {
    justify-content: center;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-secondary);
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .landing__hero {
    flex-direction: column;
    padding: 24px 20px;
    gap: 24px;
  }

  .landing__hero-content {
    max-width: 100%;
  }

  .landing__hero h1 {
    font-size: 1.8rem;
  }

  .landing__hero-image img {
    max-width: 100%;
  }

  .landing__divider {
    margin: 0 20px;
  }

  .landing__steps {
    padding: 24px 20px;
  }

  .landing__steps-grid {
    grid-template-columns: 1fr;
  }

  .landing__cta {
    margin: 24px 20px;
    padding: 24px;
  }
}
</style>
