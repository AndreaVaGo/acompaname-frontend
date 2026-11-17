<script setup>
import { RouterLink } from "vue-router";

// Mismo contacto que en el aviso legal (de demostración)
const emailContacto = "acompaname.proyecto@example.com";
</script>

<template>
  <div class="legal">
    <h1>Términos y condiciones de uso</h1>
    <p class="legal__fecha">Última actualización: noviembre de 2026</p>

    <section>
      <h2>1. Qué es Acompáñame</h2>
      <p>
        Acompáñame es una aplicación web que pone en contacto a familias con
        personas cuidadoras, tanto en el hospital como en casa. Es un proyecto
        formativo y de demostración, desarrollado como proyecto final de un
        bootcamp de desarrollo web: no presta un servicio comercial real.
      </p>
    </section>

    <section>
      <h2>2. Tu cuenta</h2>
      <p>
        Para usar la aplicación hay que crear una cuenta como
        <strong>familia</strong> o como <strong>persona cuidadora</strong>. Te
        comprometes a dar datos verdaderos, a mantener tu contraseña en secreto
        y a avisarnos si crees que alguien más ha entrado en tu cuenta.
      </p>
    </section>

    <section>
      <h2>3. Qué hace la plataforma y qué no</h2>
      <p>
        Acompáñame facilita que las familias encuentren a personas cuidadoras y
        les envíen solicitudes. El acuerdo de cuidado se establece entre la
        familia y la persona cuidadora. La plataforma no es la empleadora de las
        personas cuidadoras y no garantiza la calidad del cuidado, aunque
        ofrece valoraciones para ayudar a elegir.
      </p>
    </section>

    <section>
      <h2>4. Solicitudes y pagos</h2>
      <p>
        Las familias pueden enviar solicitudes y las personas cuidadoras
        aceptarlas o rechazarlas. Una vez completado el cuidado, la familia
        realiza el pago desde la aplicación. En esta versión de demostración
        los pagos son <strong>simulados</strong>: no se cobra ningún dinero
        real.
      </p>
    </section>

    <section>
      <h2>5. Uso adecuado</h2>
      <p>
        Está prohibido usar la aplicación para fines ilícitos, suplantar a otras
        personas, publicar contenido ofensivo o falso, o intentar acceder a
        datos que no son tuyos. Podremos suspender las cuentas que incumplan
        estas normas.
      </p>
    </section>

    <section>
      <h2>6. Valoraciones</h2>
      <p>
        Las valoraciones deben reflejar una experiencia real y escribirse con
        respeto. Podremos retirar las que sean ofensivas o falsas.
      </p>
    </section>

    <section>
      <h2>7. Disponibilidad y responsabilidad</h2>
      <p>
        Al ser un proyecto de demostración, no garantizamos que el servicio esté
        siempre disponible ni que los datos mostrados sean exactos, y no nos
        hacemos responsables de los daños que pudieran derivarse de su uso.
      </p>
    </section>

    <section>
      <h2>8. Datos personales y baja</h2>
      <p>
        Cómo tratamos tus datos se explica en la
        <RouterLink to="/privacidad">política de privacidad</RouterLink>. Si
        quieres dejar de usar Acompáñame o que borremos tus datos, escríbenos a
        <a :href="`mailto:${emailContacto}`">{{ emailContacto }}</a
        >.
      </p>
    </section>

    <section>
      <h2>9. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos. La fecha de arriba indica cuándo se
        modificaron por última vez. Si sigues usando la aplicación después de un
        cambio, entendemos que lo aceptas.
      </p>
    </section>

    <section>
      <h2>10. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por la legislación española. Consulta también el
        <RouterLink to="/aviso-legal">aviso legal</RouterLink>.
      </p>
    </section>
  </div>
</template>

<style scoped>
.legal {
  background-color: var(--color-white);
  font-family: var(--font-base);
  color: var(--color-text);
  max-width: 800px;
  margin: var(--gap-lg) auto;
  padding: 32px;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  line-height: 1.6;

  & h1 {
    margin-bottom: 4px;
  }

  & h2 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }

  & a {
    color: var(--color-accent);
  }
}

.legal__fecha {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .legal {
    margin: 16px;
    padding: 20px;
  }
}
</style>
