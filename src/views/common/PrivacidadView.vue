<script setup>
import { EMAIL_CONTACTO } from "@/utils/contacto";
// Datos del responsable (de demostración)
const titular = "Andrea V.G.";
const emailContacto = EMAIL_CONTACTO;
</script>

<template>
  <div class="pantalla">
    <div class="legal tarjeta-cristal">
    <h1>Política de privacidad</h1>
    <p class="legal__fecha">Última actualización: noviembre de 2026</p>

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
          contraseña (almacenada cifrada) y rol (familia o persona cuidadora).
        </li>
        <li>
          <strong>Datos del perfil de persona cuidadora:</strong> especialidad, años de
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
        <li>
          <strong>Fichajes del servicio:</strong> la hora a la que la persona
          cuidadora indica que empieza y que termina el servicio y, solo si está
          activada la comprobación del lugar, si en ese momento estaba cerca de
          la dirección del servicio. <strong>No guardamos coordenadas ni
          recorridos.</strong>
        </li>
        <li>
          <strong>Datos técnicos de seguridad:</strong> la dirección IP desde la
          que se intenta iniciar sesión sin éxito, para detectar abusos.
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
        personas cuidadoras y soliciten servicios, que las personas cuidadoras
        gestionen esas solicitudes, simular el pago, publicar las valoraciones de los
        servicios y dejar constancia de la hora de inicio y de fin de cada servicio.
      </p>
    </section>

    <section>
      <h2>4. Con quién se comparten</h2>
      <ul>
        <li>
          La <strong>familia</strong> ve el perfil público de la persona cuidadora, y la
          <strong>persona cuidadora</strong> elegida ve los datos de las solicitudes que
          recibe.
        </li>
        <li>
          Las <strong>valoraciones</strong> son públicas en el perfil de la
          persona cuidadora y muestran solo la puntuación, el comentario y la fecha, sin
          datos de la familia.
        </li>
        <li>
          Los <strong>fichajes</strong> de una solicitud (las horas y, si procede,
          si la persona cuidadora estaba en el lugar) los ven la familia y la
          persona cuidadora de esa solicitud, y nadie más.
        </li>
        <li>
          Si se activa la <strong>comprobación del lugar</strong>, el navegador
          te pide tu ubicación solo en el momento de fichar (puedes decir que no
          y se guarda solo la hora). Para calcular la distancia, la dirección del
          servicio se envía al servicio de mapas Nominatim (OpenStreetMap). La
          ubicación se compara con esa dirección y se descarta: no se almacena.
        </li>
        <li>
          En el registro y en el inicio de sesión usamos
          <strong>Cloudflare Turnstile</strong> para comprobar que eres una
          persona y no un programa automático. Para ello tu navegador carga un
          script de Cloudflare, que recibe datos técnicos de tu navegador, como
          tu dirección IP.
        </li>
        <li>
          Cuando buscas personas cuidadoras cerca de un lugar (una ciudad o un
          código postal), ese lugar se envía a Nominatim (OpenStreetMap) para
          convertirlo en una ubicación. La petición la hace nuestro servidor, así
          que Nominatim no recibe los datos de tu cuenta.
        </li>
        <li>
          Fuera de eso, no cedemos datos a terceros ni los usamos para
          publicidad, salvo obligación legal.
        </li>
      </ul>
    </section>

    <section>
      <h2>5. Cookies y almacenamiento</h2>
      <p>
        Esta aplicación <strong>no utiliza cookies propias</strong> ni
        herramientas de analítica o seguimiento. Solo guarda los datos de la
        sesión en el almacenamiento de sesión de tu navegador
        (<code>sessionStorage</code>), que se borra al cerrar la pestaña o al
        cerrar sesión.
      </p>
      <p>
        La comprobación de Cloudflare Turnstile del registro y del inicio de
        sesión es de un tercero y se rige por su propia política de privacidad.
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
      <p>
        Si eliminas tu cuenta, se borran tus datos personales: nombre, correo,
        teléfono y, si eres persona cuidadora, tu foto y tu descripción. Las
        solicitudes, los pagos y los mensajes de los servicios en los que
        participaste se conservan asociados a una cuenta anónima, porque la otra
        persona los necesita para su historial.
      </p>
      <p>
        Los registros técnicos con la dirección IP de los intentos fallidos de
        inicio de sesión se conservan durante 30 días.
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
  </div>
</template>

<style scoped>
/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.legal {
  --borde-tarjeta: var(--color-accent);
  font-family: var(--font-base);
  color: var(--color-text);
  max-width: 800px;
  margin: var(--gap-lg) auto;
  padding: 32px;
  line-height: 1.6;

  & h1 {
    margin-bottom: 4px;
  }

  & h2 {
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 1.1rem;
    color: var(--color-accent-dark);
  }

  & a {
    color: var(--color-accent-dark);
  }

  & ul {
    padding-left: 20px;
  }

  & li {
    margin-bottom: 6px;
  }
}

/* Es un texto largo para leer: la tarjeta no se levanta ni brilla al pasar el ratón */
.legal:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.legal::after {
  display: none;
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