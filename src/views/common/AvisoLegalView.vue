<script setup>
// Datos del titular (de demostración)
const titular = "Andrea V.G.";
const emailContacto = "acompaname.proyecto@example.com";
</script>

<template>
  <div class="legal">
    <h1>Aviso legal</h1>
    <p class="legal__fecha">Última actualización: octubre de 2026</p>

    <section>
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
        informa de que este sitio web, <strong>Acompáñame</strong>, es
        titularidad de {{ titular }}, y se ha desarrollado como proyecto final
        del bootcamp de desarrollo web full stack de Factoría F5 Asturias.
      </p>
      <p>
        Contacto: <a :href="`mailto:${emailContacto}`">{{ emailContacto }}</a>
      </p>
    </section>

    <section>
      <h2>2. Finalidad del sitio</h2>
      <p>
        Acompáñame es una aplicación web que conecta a familias con cuidadores
        de personas mayores. Se trata de un proyecto formativo y de demostración:
        no presta un servicio comercial real, y los pagos que se muestran son
        simulados.
      </p>
    </section>

    <section>
      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y uso de este sitio atribuye la condición de usuario e implica
        la aceptación de este aviso legal. El usuario se compromete a hacer un
        uso adecuado del sitio y a no emplearlo para fines ilícitos o que
        puedan dañar a terceros o al funcionamiento de la aplicación.
      </p>
    </section>

    <section>
      <h2>4. Propiedad intelectual</h2>
      <p>
        El código, el diseño y los contenidos de este sitio pertenecen a su
        titular, salvo que se indique lo contrario. Queda prohibida su
        reproducción o distribución con fines comerciales sin autorización
        previa.
      </p>
    </section>

    <section>
      <h2>5. Responsabilidad</h2>
      <p>
        Al ser un proyecto de demostración, el titular no garantiza la
        disponibilidad continua del sitio ni la exactitud de los datos que
        contiene, y no se hace responsable de los daños que pudieran derivarse
        de su uso. Los perfiles de cuidadores y las valoraciones mostrados
        pueden ser datos de prueba.
      </p>
    </section>

    <section>
      <h2>6. Protección de datos</h2>
      <p>
        El tratamiento de los datos personales se explica en la
        <RouterLink to="/privacidad">política de privacidad</RouterLink>.
      </p>
    </section>

    <section>
      <h2>7. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier
        controversia, las partes se someterán a los juzgados y tribunales que
        correspondan conforme a la normativa vigente.
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