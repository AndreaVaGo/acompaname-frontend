![Acompáñame — Frontend](docs/banner-front.png)

# 🤝 Acompáñame — Frontend

**Acompáñame** es una plataforma de marketplace que conecta a familias que necesitan cuidados para un ser querido con cuidadores profesionales verificados. Nace para cubrir el hueco entre la atención residencial a tiempo completo y las listas de espera de la atención formal.

Este repositorio contiene la **aplicación web** del proyecto, desarrollada con **Vue 3**. La API REST (Spring Boot) vive en un repositorio independiente, enlazado más abajo.

Proyecto final del bootcamp de Desarrollo Web Full Stack (850h) en **Factoría F5 — Digital Academy**.

![Vue](https://img.shields.io/badge/Vue-3-42b883) ![Vite](https://img.shields.io/badge/Vite-8-646CFF) ![Pinia](https://img.shields.io/badge/Pinia-estado-yellow) ![Vitest](https://img.shields.io/badge/tests-338-success) ![Responsive](https://img.shields.io/badge/responsive-768px-blue)

> [!TIP]
> 📚 **Documentación completa en la [wiki del proyecto](https://github.com/AndreaVaGo/acompaname-frontend/wiki).** Aquí está lo imprescindible para entender, arrancar y probar el frontend; el detalle (decisiones, diseño, diagramas y tests) está en la wiki.

---

## 📑 Tabla de contenidos

- [Descripción del proyecto](#-descripción-del-proyecto)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Instalación y uso](#-instalación-y-uso)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Pantallas y rutas](#-pantallas-y-rutas)
- [Decisiones técnicas](#-decisiones-técnicas)
- [Diseño y capturas](#-diseño-y-capturas)
- [Diagramas técnicos](#-diagramas-técnicos)
- [Tests](#-tests)
- [Herramientas](#-herramientas)
- [Enlaces del proyecto](#-enlaces-del-proyecto)
- [Problemas conocidos](#-problemas-conocidos)
- [Próximos pasos](#-próximos-pasos)
- [Autora](#-autora)

---

## 📖 Descripción del proyecto

**Acompáñame** resuelve un problema real: encontrar apoyo puntual y de confianza para el cuidado de personas mayores o dependientes, sin necesidad de contratar servicios residenciales completos.

Las **familias** pueden:
- 📝 Registrarse e iniciar sesión
- 🔎 Buscar cuidadores con filtros (ciudad, tipo de cuidado, sexo, servicios, disponibilidad, vehículo, valoración mínima y fechas libres) y consultar su perfil y sus reseñas
- 📋 Enviar solicitudes de servicio y seguir su estado
- 💳 Pagar el servicio (el pago se marca como completado en el backend, se muestra una confirmación y la solicitud pasa a verse como pagada; los datos de la tarjeta son de prueba)
- ⭐ Valorar el servicio una vez completado y ver en el historial qué servicios ya están valorados
- 👤 Editar sus datos de contacto y cambiar la contraseña

Los **cuidadores** pueden:
- 🧑‍⚕️ Registrarse y gestionar su perfil profesional
- 📥 Recibir solicitudes y aceptarlas o rechazarlas
- 👤 Editar sus datos de contacto y cambiar la contraseña

Cualquier visitante puede consultar el **aviso legal** y la **política de privacidad** desde el pie de página.

---

## 🛠 Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| 🖖 Framework | Vue 3 (Composition API, <mark>&lt;script setup&gt;</mark>) |
| ⚡ Build tool | Vite 8 |
| 🍍 Estado | Pinia |
| 🧭 Rutas | Vue Router 5 |
| 🔌 Consumo de API | Repository Pattern sobre <mark>fetch</mark> con Basic Auth |
| 🎨 Estilos | CSS puro, BEM y variables CSS |
| 🧪 Tests | Vitest, Vue Test Utils, jsdom |

---

## 🚀 Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/AndreaVaGo/acompaname-frontend.git

# Entrar en la carpeta del proyecto
cd acompaname-frontend

# Instalar las dependencias
npm install

# Arrancar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en <mark>http://localhost:5173</mark> 🎉.

> [!IMPORTANT]
> Para que funcione completamente, el backend debe estar arrancado en <mark>http://localhost:8080</mark> (ver el README del repositorio de backend).

| Comando | Descripción |
|---|---|
| <mark>npm run dev</mark> | Servidor de desarrollo |
| <mark>npm run build</mark> | Build de producción |
| <mark>npm run preview</mark> | Previsualizar el build |
| <mark>npm run test:unit</mark> | Ejecutar los tests |

---

## 📁 Estructura del proyecto

```
src/
├── assets/          Imágenes, bocetos y diagramas
├── components/      NavBar, AppFooter, SolicitudCard, FotoCuidador (reutilizables)
├── pinia/           Configuración de Pinia
├── repositories/    Auth, Cuidador, Pago, Role, Solicitud, Usuario, Valoracion + Repository base
├── router/          Definición de rutas
├── stores/          auth.js (estado de sesión)
├── styles/          variables.css, base.css, style.css
├── tests/           Tests de componentes, vistas, rutas, store y repositorios
├── utils/           catalogoCuidados.js, formatearFecha.js, reducirImagen.js
├── views/           Una vista por pantalla, en carpetas: auth, caregiver, common, family
├── App.vue
└── main.js
```

Esta estructura separa claramente responsabilidades: las **vistas** (<mark>views/</mark>) representan pantallas completas, los **componentes** (<mark>components/</mark>) contienen piezas reutilizables entre vistas, los **repositorios** (<mark>repositories/</mark>) encapsulan toda la comunicación con la API, el **store** (<mark>stores/</mark>) centraliza el estado de sesión, y los **estilos globales** (<mark>styles/</mark>) evitan duplicar valores de diseño (colores, espaciados) en cada archivo.

---

## 📱 Pantallas y rutas

| # | Pantalla | Ruta | Descripción |
|---|---|---|---|
| 1 | 🏠 **Landing** | <mark>/</mark> | Página pública de bienvenida, con propuesta de valor y accesos a registro/login |
| 2 | ✍️ **Registro** | <mark>/registro</mark> | Formulario con selección de rol (Familia / Cuidador), cargado dinámicamente desde la API |
| 3 | 🔑 **Inicio de sesión** | <mark>/login</mark> | Acceso con email y contraseña |
| 4 | 🔍 **Búsqueda de cuidadores** | <mark>/buscar</mark> | Listado con filtros por ciudad, tipo de cuidado, sexo, servicios, disponibilidad, vehículo propio, valoración mínima y fechas (oculta a los cuidadores que ya tienen un servicio aceptado esos días) |
| 5 | 🧑‍⚕️ **Perfil de cuidador** (público) | <mark>/cuidador/:id</mark> | Datos profesionales, valoración media y ventana con las reseñas de las familias |
| 6 | 📝 **Solicitud de servicio** | <mark>/solicitar/:id</mark> | Formulario para pedir el acompañamiento a un cuidador concreto (tipo de cuidado, dirección u hospital, fechas, paciente y necesidades) |
| 7 | ✅ **Confirmación de solicitud** | <mark>/confirmacion</mark> | Aviso de solicitud enviada |
| 8 | 📜 **Historial de solicitudes** | <mark>/historial</mark> | Estado final de cada acompañamiento; la familia puede valorar y ve cuáles ya están valoradas |
| 9 | 📨 **Solicitudes enviadas** (Familia) | <mark>/solicitudes</mark> | Estado de las solicitudes enviadas a distintos cuidadores |
| 10 | 💳 **Checkout** (Familia) | <mark>/pagar/:id</mark> | Pago de un servicio (tarjeta de prueba) con pantalla de confirmación |
| 11 | ⭐ **Formulario de valoración** (Familia) | <mark>/valorar/:id</mark> | Puntuación de 1 a 5 estrellas y comentario |
| 12 | 📥 **Solicitudes recibidas** (Cuidador) | <mark>/solicitudes-cuidador</mark> | Gestión de aceptar/rechazar |
| 13 | 👤 **Mi perfil** (Familia) | <mark>/mi-perfil</mark> | Datos de la cuenta |
| 14 | ✏️ **Editar perfil** (Cuidador) | <mark>/editar-perfil</mark> | Foto (se elige desde el ordenador), especialidad, ciudad, tipo y servicios de cuidado, sexo, experiencia, tarifa, descripción, vehículo y disponibilidad |
| 15 | 🧾 **Editar datos** | <mark>/editar-datos</mark> | Cambiar nombre, email y teléfono |
| 16 | 🔐 **Cambiar contraseña** | <mark>/cambiar-password</mark> | Contraseña actual, nueva y repetida |
| 17 | ⚖️ **Aviso legal** | <mark>/aviso-legal</mark> | Datos del titular y condiciones de uso (público) |
| 18 | 🛡️ **Política de privacidad** | <mark>/privacidad</mark> | Cómo se tratan los datos personales (público) |

Las rutas privadas comprueban en el router que haya sesión y, cuando hace falta, el rol (<mark>FAMILIA</mark> o <mark>CUIDADOR</mark>); si no se cumple, redirigen al login.

Cada vista incluye sus correspondientes estados vacíos (por ejemplo, "Aún no tienes solicitudes") y mensajes de error ante fallos de carga o de envío, para que la interfaz nunca se muestre rota ni en blanco.

---

## 🧩 Decisiones técnicas

📄 Documento completo con el proceso y los problemas encontrados: [docs/decisiones-tecnicas.pdf](docs/decisiones-tecnicas.pdf)

Algunas de las decisiones principales:

- 🎨 **BEM + variables CSS globales** para colores, radios y espaciados.
- 🔌 **Repository Pattern** para el consumo de la API: cada entidad tiene su repositorio, que extiende una clase base.
- 🍍 **Estado de sesión con Pinia** (<mark>useAuthStore</mark>), persistido en <mark>sessionStorage</mark>.
- 🧭 **<mark>NavBar</mark> compartido**, que muestra enlaces distintos según el rol.
- 🔎 **Filtros de búsqueda en el navegador** y **filtro por fechas con ayuda del backend** (<mark>GET /solicitudes/cuidadores-ocupados</mark>).
- 📱 **Diseño responsive** con media queries (punto de corte de 768 px).

👉 Todas las decisiones y la metodología de trabajo: [Decisiones técnicas](https://github.com/AndreaVaGo/acompaname-frontend/wiki/Decisiones-tecnicas).

---

## 🎨 Diseño y capturas

Proceso de diseño: bocetos → wireframes → mockups → prototipo, para móvil, tablet y escritorio.

| Landing | Buscar | Solicitar |
|---|---|---|
| ![landing](docs/screenshots/landing.png) | ![buscar](docs/screenshots/buscar.png) | ![solicitar](docs/screenshots/solicitar.png) |

👉 Bocetos, mockups y todas las capturas de la app: [Diseño y capturas](https://github.com/AndreaVaGo/acompaname-frontend/wiki/Diseno-y-capturas).

---

## 📊 Diagramas técnicos

Arquitectura del frontend, flujo de navegación, casos de uso, diagramas de secuencia (registro y login, solicitar un servicio), diagrama entidad-relación y diagrama de clases, todos en Mermaid y visibles directamente en GitHub.

👉 [Diagramas técnicos](https://github.com/AndreaVaGo/acompaname-frontend/wiki/Diagramas-tecnicos)

---

## ✅ Tests

El proyecto tiene **338 tests unitarios** en 32 archivos (Vitest + Vue Test Utils) y **9 tests e2e** (Playwright). Los unitarios mockean el repositorio correspondiente para no depender del backend; los e2e abren un navegador de verdad y **necesitan el backend arrancado**.

```bash
npm run test:unit      # tests unitarios
npm run test:coverage  # cobertura (informe en coverage/index.html)
npm run test:e2e       # tests e2e (con el backend en marcha)
```

Cobertura actual: **98 % de líneas**, **98 % de ramas**, **98 % de sentencias** y **97 % de funciones** (el mínimo pedido era el 70 %).

![Resultado de los tests del frontend](docs/screenshots/tests-frontend.png)
![Cobertura de los tests del frontend](docs/screenshots/cobertura-frontend.png)

👉 Qué comprueba cada carpeta de tests y los tests e2e: [Tests](https://github.com/AndreaVaGo/acompaname-frontend/wiki/Tests).

---

## 🧰 Herramientas

- 💻 Visual Studio Code
- 🖖 Vue 3 (Composition API)
- 🍍 Pinia
- 🧭 Vue Router
- ⚡ Vite
- ✅ Vitest + Vue Test Utils
- 🎭 Playwright (tests e2e)
- 📮 Postman (pruebas de integración con el backend)
- 🗄️ DBeaver (inspección de la base de datos durante el desarrollo)
- 📋 JIRA (gestión del proyecto)

---

## 🔗 Enlaces del proyecto

| Recurso | Enlace |
|---|---|
| 🍃 Repositorio backend | https://github.com/AndreaVaGo/acompaname-backend |
| 🖥️ Repositorio frontend | https://github.com/AndreaVaGo/acompaname-frontend |
| 📊 Gestión del proyecto (JIRA) | https://saludosalamanecer-1780468848301.atlassian.net/jira/software/projects/ACOM/boards/34/timeline?rangeMode=MONTHS |
| 🎨 Diseño en Figma | https://www.figma.com/design/iNrrCJOe6CkQXTxhGzK7rj/Acomp%C3%A1%C3%B1ame |
| 💜 Prototipo (Lovable) | https://care-connection-hub-18.lovable.app |
| 🎤 Presentación | [docs/presentacion.pdf](docs/presentacion.pdf) |

---

## 🐞 Problemas conocidos

> [!NOTE]
> Estos son los puntos identificados como mejorables en la versión actual (MVP).

- 💳 El checkout (<mark>/pagar/:id</mark>) llama al endpoint <mark>PATCH /pagos/{id}/pagar</mark> del backend y el pago queda como completado, pero los datos de la tarjeta son de prueba: no se cobra nada ni hay pasarela de pago real.
- 🔑 La autenticación es Basic Auth: las credenciales viajan en cada petición.
- 🎨 Algunas vistas todavía tienen colores escritos a mano en el CSS en vez de usar las variables de la paleta (pendiente de <mark>refactorizar</mark>).

---

## 🗺️ Próximos pasos

- 🔐 Implementar autenticación basada en JWT (actualmente Basic Auth)
- 🌐 Revisar la configuración de CORS tras la migración a JWT
- 💳 Conectar el checkout con una pasarela de pago real (por ejemplo Stripe en modo test)
- 🖼️ Guardar las fotos de perfil como archivos en un almacenamiento externo (ahora se envían reducidas a 300 px y se guardan como texto)
- 🚀 Desplegar frontend y backend

---

## 👩‍💻 Autora

**Andrea Vallina González** — Proyecto Final, Bootcamp Desarrollo Web Full Stack, Factoría F5.

- GitHub: [@AndreaVaGo](https://github.com/AndreaVaGo)
- LinkedIn: [Andrea Vallina González](https://www.linkedin.com/in/andrea-vallina-gonzalez/)