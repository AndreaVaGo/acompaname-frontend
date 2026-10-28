<script setup>
import { RouterLink } from "vue-router";
import AnimacionComoFunciona from "../../components/animation/AnimacionComoFunciona.vue";
import AparecerAlVer from "../../components/animation/AparecerAlVer.vue";
</script>

<template>
  <div class="landing">
    <section class="landing__hero">
      <div class="landing__hero-content">
        <span class="landing__badge">
          <span class="landing__badge-icon">♥</span>
          Nunca sola, nunca solo
        </span>
        <h1>
          Personas cuidadoras de confianza, cuando tu familia más lo necesita
        </h1>
        <p class="landing__hero-text">
          Encuentra profesionales para acompañar en el hospital o en casa a
          quien lo necesite por enfermedad o dependencia, sea cual sea su edad.
          Sin llamadas interminables ni papeleo.
        </p>
        <div class="landing__hero-actions">
          <RouterLink to="/registro" class="btn btn--primary"
            >Registrarme</RouterLink
          >
          <RouterLink to="/login" class="btn btn--secondary"
            >Iniciar sesión</RouterLink
          >
        </div>
        <p class="landing__hint">
          ¿Solo quieres mirar?
          <RouterLink to="/buscar" class="landing__link"
            >Ver personas cuidadoras disponibles</RouterLink
          >
        </p>
      </div>
      <div class="landing__hero-image">
        <!-- Animación de 15 segundos que explica cómo funciona la web (sustituye a la foto) -->
        <AnimacionComoFunciona />
      </div>
    </section>

    <hr class="landing__divider" />

    <section class="landing__steps">
      <h2>Así de sencillo</h2>
      <div class="landing__steps-grid">
        <AparecerAlVer class="landing__step-card" :retraso="0">
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
        </AparecerAlVer>
        <AparecerAlVer class="landing__step-card" :retraso="250">
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
        </AparecerAlVer>
        <AparecerAlVer class="landing__step-card" :retraso="500">
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
          <p>La persona cuidadora acepta y os coordináis desde la app.</p>
        </AparecerAlVer>
      </div>
    </section>

    <hr class="landing__divider" />

    <AparecerAlVer class="landing__cta">
      <div class="landing__cta-icon">🏠</div>
      <h2>¿Eres cuidador o cuidadora profesional?</h2>
      <p>
        Publica tu perfil, recibe solicitudes de familias cercanas y gestiona tu
        agenda desde un único sitio.
      </p>
      <RouterLink to="/registro?rol=cuidador" class="btn btn--primary"
        >Crear mi perfil profesional</RouterLink
      >
    </AparecerAlVer>

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

.btn {
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  display: inline-block;
}

.btn--primary {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.btn--secondary {
  background-color: var(--color-white);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.landing__hint {
  color: var(--color-text-muted);
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
}

/* El enlace va en su propia línea, debajo de la pregunta */
.landing__link {
  display: block;
  margin-top: 6px;
  color: var(--color-secondary);
  font-size: 1.1rem;
  font-weight: bold;
  text-decoration: underline;
}

/* El texto a la izquierda y la animación a la derecha, centrada en vertical */
.landing__hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.landing__hero-content {
  max-width: 650px;
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
  margin-bottom: 32px;
}

/* La animación es cuadrada y ocupa el mismo hueco que tenía la foto */
.landing__hero-image {
  flex-shrink: 0;
  width: 500px;
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
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

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
  transition: transform 0.25s ease;
  /* Latido suave: un halo coral que se expande y se apaga */
  --halo: rgba(242, 137, 107, 0.45);
  animation: latido 3s ease-out infinite;
}

/* Cada tarjeta late un poco después que la anterior */
.landing__step-card:nth-child(2) .landing__step-icon {
  animation-delay: 1s;
}

.landing__step-card:nth-child(3) .landing__step-icon {
  animation-delay: 2s;
}

@keyframes latido {
  0% {
    box-shadow: 0 0 0 0 var(--halo);
  }
  60%,
  100% {
    box-shadow: 0 0 0 14px transparent;
  }
}

/* Al pasar el ratón, la tarjeta sube un poco y su icono se inclina */
.landing__step-card:hover,
.landing__cta:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.landing__step-card:hover .landing__step-icon,
.landing__cta:hover .landing__cta-icon {
  transform: rotate(-10deg) scale(1.12);
  animation: none;
}

.landing__cta {
  background-color: var(--color-white);
  max-width: 600px;
  margin: 32px auto;
  padding: 32px;
  border-radius: var(--radius-card);
  text-align: center;
  box-shadow: var(--shadow-card);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

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
  transition: transform 0.25s ease;
  --halo: rgba(46, 125, 91, 0.35);
  animation: latido 3s ease-out infinite;
}

/* Quien prefiere menos movimiento no ve ni el latido ni los efectos al pasar el ratón */
@media (prefers-reduced-motion: reduce) {
  .landing__step-card,
  .landing__step-icon,
  .landing__cta,
  .landing__cta-icon {
    transition: none;
    animation: none;
  }

  .landing__step-card:hover,
  .landing__cta:hover,
  .landing__step-card:hover .landing__step-icon,
  .landing__cta:hover .landing__cta-icon {
    transform: none;
  }
}

@media (max-width: 768px) {
  .landing__hero {
    flex-direction: column;
    align-items: stretch;
    padding: 24px 20px;
    gap: 24px;
  }

  .landing__hero-content {
    max-width: 100%;
  }

  .landing__hero h1 {
    font-size: 1.8rem;
  }

  .landing__hero-image {
    width: 100%;
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