<script setup>
// Datos del responsable (de demostración)
const titular = "Andrea V.G.";
const emailContacto = "acompaname.proyecto@example.com";
</script>

<template>
  <div class="legal">
    <h1>Política de privacidad</h1>
    <p class="legal__fecha">Última actualización: octubre de 2026</p>

    <p class="legal__aviso">
      Acompáñame es un proyecto formativo y de demostración. Este texto es una
      plantilla adaptada al Reglamento General de Protección de Datos (RGPD) y a
      la Ley Orgánica 3/2018 (LOPDGDD), y debería revisarlo un profesional antes
      de un uso real.
    </p>

    <section>
      <h2>1. Responsable del tratamiento</h2>
      <p>
        {{ titular }}, como autora del proyecto. Contacto:
        <a :href="`mailto:${emailContacto}`">{{ emailContacto }}</a>
      </p>
    </section>

    <section>
      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Datos de la cuenta:</strong> nombre, correo electrónico,
          contraseña (almacenada cifrada) y rol (familia o cuidador).
        </li>
        <li>
          <strong>Datos del perfil de cuidador:</strong> especialidad, años de
          experiencia, tarifa, disponibilidad, servicios, descripción y, si la
          aporta, su foto.
        </li>
        <li>
          <strong>Datos de las solicitudes:</strong> nombre y edad de la
          persona a cuidar, tipo de cuidado, necesidades, notas, fechas y
          dirección del domicilio u hospital.
        </li>
        <li>
          <strong>Valoraciones:</strong> puntuación, comentario y fecha.
        </li>
      </ul>
      <p>
        Las necesidades de cuidado y las notas pueden revelar información sobre
        la salud de la persona cuidada, que el RGPD considera una categoría
        especial de datos. Por eso solo debes introducir la información
        necesaria para el servicio, y su tratamiento se basa en tu
        consentimiento al enviar la solicitud.
      </p>
    </section>

    <section>
      <h2>3. Para qué los usamos</h2>
      <p>
        Para gestionar tu cuenta, permitir que las familias encuentren
        cuidadores y soliciten servicios, que los cuidadores gestionen esas
        solicitudes, simular el pago y publicar las valoraciones de los
        servicios.
      </p>
    </section>

    <section>
      <h2>4. Con quién se comparten</h2>
      <ul>
        <li>
          La <strong>familia</strong> ve el perfil público del cuidador, y el
          <strong>cuidador</strong> elegido ve los datos de las solicitudes que
          recibe.
        </li>
        <li>
          Las <strong>valoraciones</strong> son públicas en el perfil del
          cuidador y muestran solo la puntuación, el comentario y la fecha, sin
          datos de la familia.
        </li>
        <li>
          No cedemos datos a terceros ni los usamos para publicidad, salvo
          obligación legal.
        </li>
      </ul>
    </section>

    <section>
      <h2>5. Cookies y almacenamiento</h2>
      <p>
        Esta aplicación <strong>no utiliza cookies</strong> ni herramientas de
        analítica o seguimiento. Solo guarda los datos de la sesión en el
        almacenamiento de sesión de tu navegador (<code>sessionStorage</code>),
        que se borra al cerrar la pestaña o al cerrar sesión.
      </p>
    </section>

    <section>
      <h2>6. Pagos</h2>
      <p>
        Los pagos son simulados: no se procesan pagos reales ni se recogen
        datos bancarios.
      </p>
    </section>

    <section>
      <h2>7. Cuánto tiempo los conservamos</h2>
      <p>
        Mientras la cuenta exista y, al ser un proyecto de demostración, hasta
        que se eliminen los datos de prueba. Puedes pedir su supresión en
        cualquier momento.
      </p>
    </section>

    <section>
      <h2>8. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión,
        oposición, limitación del tratamiento y portabilidad escribiendo a
        <a :href="`mailto:${emailContacto}`">{{ emailContacto }}</a
        >. También puedes presentar una reclamación ante la Agencia Española de
        Protección de Datos (<a
          href="https://www.aepd.es"
          target="_blank"
          rel="noopener noreferrer"
          >www.aepd.es</a
        >).
      </p>
    </section>

    <section>
      <h2>9. Más información</h2>
      <p>
        Consulta también el
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

  & ul {
    padding-left: 20px;
  }

  & li {
    margin-bottom: 6px;
  }
}

.legal__fecha {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.legal__aviso {
  background-color: var(--color-accent-bg);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .legal {
    margin: 16px;
    padding: 20px;
  }
}
</style>