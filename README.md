![Acompáñame — Frontend](docs/banner-front.png)

# 🤝 Acompáñame — Frontend

**Acompáñame** es una plataforma de marketplace que conecta a familias que necesitan cuidados para un ser querido con cuidadores profesionales verificados. Nace para cubrir el hueco entre la atención residencial a tiempo completo y las listas de espera de la atención formal.

Este repositorio contiene la **aplicación web** del proyecto, desarrollada con **Vue 3**. La API REST (Spring Boot) vive en un repositorio independiente, enlazado más abajo.

Proyecto final del bootcamp de Desarrollo Web Full Stack (850h) en **Factoría F5 — Digital Academy**.

![Vue](https://img.shields.io/badge/Vue-3-42b883) ![Vite](https://img.shields.io/badge/Vite-8-646CFF) ![Pinia](https://img.shields.io/badge/Pinia-estado-yellow) ![Vitest](https://img.shields.io/badge/tests-324-success) ![Responsive](https://img.shields.io/badge/responsive-768px-blue)

---

## 📑 Tabla de contenidos

- [Descripción del proyecto](#-descripción-del-proyecto)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Instalación y uso](#-instalación-y-uso)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Pantallas y rutas](#-pantallas-y-rutas)
- [Decisiones técnicas](#-decisiones-técnicas)
- [Metodología de trabajo](#-metodología-de-trabajo)
- [Diseño: bocetos, mockups y prototipo](#-diseño-bocetos-mockups-y-prototipo)
- [Screenshots](#-screenshots)
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
- 🔎 Buscar cuidadores con filtros (ciudad, tipo de cuidado, sexo, servicios, disponibilidad, vehículo y valoración mínima) y consultar su perfil y sus reseñas
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
| 4 | 🔍 **Búsqueda de cuidadores** | <mark>/buscar</mark> | Listado con filtros por ciudad, tipo de cuidado, sexo, servicios, disponibilidad, vehículo propio y valoración mínima |
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

🎨 **BEM + variables CSS globales.** Se adoptó esta convención de nomenclatura (<mark>bloque__elemento--modificador</mark>) junto con variables centralizadas en <mark>:root</mark> para los colores, radios de borde, sombras y espaciados. Esto evita repetir valores sueltos por todo el proyecto y facilita que un cambio de diseño (por ejemplo, el color de acento) se propague automáticamente a todas las vistas sin tener que editarlas una a una.

🧭 **Componente <mark>NavBar</mark> compartido.** Para no repetir la navegación en cada vista, se refactorizó en un único componente incluido en <mark>App.vue</mark>. Muestra distintos enlaces según el rol del usuario (Familia ve "Buscar", Cuidador no), y a los visitantes sin sesión les ofrece "Iniciar sesión" y "Registrarme", que se ocultan en las propias pantallas de login y registro.

🔌 **Repository Pattern para el consumo de la API.** Cada entidad tiene su propio repositorio (<mark>UsuarioRepository</mark>, <mark>SolicitudRepository</mark>, etc.) que extiende de una clase base (<mark>Repository.js</mark>) con los métodos genéricos <mark>get</mark>/<mark>post</mark>/<mark>put</mark>/<mark>delete</mark>. Esta clase base añade automáticamente las cabeceras de autenticación (Basic Auth, leyendo las credenciales guardadas en <mark>sessionStorage</mark> tras el login), de forma que las vistas nunca gestionan la autenticación directamente, solo llaman a métodos de negocio como <mark>getMiPerfil()</mark> o <mark>getMisSolicitudes()</mark>. Este patrón también simplifica el testing: los componentes se testean mockeando únicamente el repositorio correspondiente (<mark>vi.spyOn(Repository.prototype, "metodo")</mark>), sin necesidad de levantar el backend real durante los tests.

🍍 **Estado de sesión con Pinia.** El store <mark>useAuthStore</mark> guarda <mark>id</mark>, <mark>email</mark>, <mark>rol</mark> y <mark>credenciales</mark> del usuario autenticado (persistidos en <mark>sessionStorage</mark> para sobrevivir recargas de página), con acciones <mark>login()</mark> y <mark>logout()</mark>. Esto permite que cualquier vista consulte el rol o los datos del usuario activo — por ejemplo, para mostrar u ocultar el botón "Solicitar servicio" en el perfil de un cuidador según si quien lo visualiza es una familia o otro cuidador.

🃏 **Componente <mark>SolicitudCard</mark> reutilizable.** La tarjeta que muestra una solicitud (familia/cuidador, tipo de cuidado, fecha, notas y estado) se repetía casi de forma idéntica en las vistas de "Solicitudes recibidas" y "Solicitudes enviadas", con la única diferencia de mostrar o no los botones de Aceptar/Rechazar. Se refactorizó en un componente único que recibe esos datos por _props_, evitando duplicar el HTML y el CSS en dos archivos.

✅ **Validación de formularios.** Los formularios de Login, Registro, Solicitud de servicio y Valoración comprueban que los campos obligatorios no estén vacíos antes de enviar la petición, mostrando un mensaje de error visible en caso contrario. Además, cada llamada a la API está envuelta en <mark>try/catch</mark> para mostrar un mensaje de error legible si el backend responde con un fallo, en lugar de dejar la interfaz colgada o en blanco.

⚡ **Vistas interactivas.** Varias vistas incluyen lógica funcional más allá de la maqueta visual: el cambio de estado de una solicitud (Aceptar/Rechazar) actualiza la interfaz al instante gracias a <mark>ref()</mark>, el selector de rol en el registro usa _class binding_ dinámico (<mark>:class</mark>), y el selector de estrellas en la valoración es completamente interactivo.

🔎 **Filtros de búsqueda en el navegador.** La lista de cuidadores se carga una vez y los filtros (ciudad, tipo de cuidado, sexo, servicios, disponibilidad, vehículo y valoración mínima) se aplican con una propiedad <mark>computed</mark>. Así la lista se actualiza al instante y sin pedir nada más al servidor, algo razonable con el volumen de datos de este proyecto.

🗂️ **Catálogo de cuidados en un solo archivo.** <mark>catalogoCuidados.js</mark> guarda cada servicio con su código (lo que se guarda en la base de datos) y su nombre (lo que se ve en pantalla). Lo usan el perfil del cuidador y el formulario de solicitud, y así no se repiten las listas ni los textos.

⭐ **Reseñas del cuidador desde un endpoint público.** El perfil público de un cuidador carga sus valoraciones con <mark>GET /valoraciones/cuidador/{id}</mark> y las muestra en una ventana. El listado general de valoraciones (<mark>GET /valoraciones</mark>) solo devuelve las del usuario con sesión, porque el filtrado se hace en el backend y no en el frontend.

⚖️ **Pie de página y páginas legales.** Un componente <mark>AppFooter</mark> compartido enlaza el aviso legal y la política de privacidad desde todas las pantallas, como se espera de una web real.

🧹 **Refactorizar sin cambiar el comportamiento.** Después de la entrega se renombraron las carpetas de las vistas al inglés (<mark>family</mark>, <mark>caregiver</mark>, <mark>common</mark>) y se amplió el conjunto de tests. Cada paso se hizo en su propia rama y su propio commit, y los tests siguen en verde.

📱 **Diseño responsive con media queries.** Todas las vistas incluyen ajustes para pantallas móviles (principalmente en el punto de corte de 768px), transformando disposiciones en columnas (grid, flex en fila) a disposiciones apiladas verticales, y reduciendo espaciados para aprovechar mejor el espacio disponible.

---

## 🔄 Metodología de trabajo

El desarrollo siguió un enfoque iterativo: primero se construyó la estructura HTML de cada vista con datos de ejemplo, después se aplicaron los estilos comparando visualmente con el prototipo de diseño, posteriormente se refactorizó el CSS a BEM con variables globales, y finalmente se sustituyeron los datos de ejemplo por llamadas reales a la API REST a través del Repository Pattern, una vez que el backend estuvo disponible.

La gestión del proyecto se organizó en **JIRA** (proyecto <mark>ACOM</mark>) con 8 épicas, 19 historias de usuario redactadas con criterios de aceptación en formato Gherkin (Given/When/Then), 43 tareas técnicas y 5 sprints entre agosto y octubre de 2026. El control de versiones se llevó con commits descriptivos en inglés, agrupados por unidad funcional (una vista, un bloque de responsive, un refactor concreto, un archivo de test).

🔗 Tablero de JIRA: https://saludosalamanecer-1780468848301.atlassian.net/jira/software/projects/ACOM/boards/34/timeline?rangeMode=MONTHS

![Cronograma de JIRA](docs/jira/jira-cronograma.png)

---

## 🎨 Diseño: bocetos, mockups y prototipo

Proceso de diseño: **bocetos → wireframes → mockups → prototipo**, pensado para móvil, tablet y escritorio.

### ✏️ Bocetos iniciales

**<ins>Landing</ins>**
![boceto-landing](./src/assets/boceto_landing.png)

**<ins>Registro</ins>**
![boceto-registro](./src/assets/boceto_registro.png)

**<ins>Buscar cuidadores</ins>**
![boceto-buscar](./src/assets/boceto_buscar.png)

**<ins>Perfil de cuidador (vista Familia)</ins>**
![boceto-perfil-familia](./src/assets/boceto_perfil_familia.png)

**<ins>Perfil de cuidador (vista Cuidador)</ins>**
![boceto-perfil-cuidador](./src/assets/boceto_perfil_cuidador_rol.png)

**<ins>Solicitar servicio</ins>**
![boceto-solicitar](./src/assets/boceto_solicitar.png)

**<ins>Solicitudes recibidas</ins>**
![boceto-solicitudes](./src/assets/boceto_solicitudes_cuidador.png)

### 🖼️ Mockups (escritorio)

| <ins>Landing</ins> | <ins>Login</ins> | <ins>Registro</ins> |
|---|---|---|
| ![Landing](docs/design/01-landing_escritorio.png) | ![Login](docs/design/02-login_escritorio.png) | ![Registro](docs/design/03-registro_escritorio.png) |

| <ins>Buscar</ins> | <ins>Perfil del cuidador</ins> | <ins>Solicitar</ins> |
|---|---|---|
| ![Buscar](docs/design/04-buscar_escritorio.png) | ![Perfil](docs/design/05-perfil-cuidador_escritorio.png) | ![Solicitar](docs/design/06-solicitar_escritorio.png) |

| <ins>Mis solicitudes</ins> | <ins>Solicitudes recibidas</ins> | <ins>Historial</ins> | <ins>Valorar</ins> |
|---|---|---|---|
| ![Mis solicitudes](docs/design/07-solicitudes-familia_escritorio.png) | ![Solicitudes recibidas](docs/design/08-solicitudes-cuidador_escritorio.png) | ![Historial](docs/design/09-historial_escritorio.png) | ![Valorar](docs/design/10-valorar_escritorio.png) |

- **Figma:** https://www.figma.com/design/iNrrCJOe6CkQXTxhGzK7rj/Acomp%C3%A1%C3%B1ame
- **Prototipo en Lovable:** https://care-connection-hub-18.lovable.app

---

## 📸 Screenshots

Capturas de la aplicación en funcionamiento (vista de escritorio, salvo la última).

**<ins>Landing</ins>**
![landing](docs/screenshots/landing.png)

**<ins>Login</ins>**
![login](docs/screenshots/login.png)

**<ins>Registro (rol cuidador)</ins>**
![registro](docs/screenshots/registro.png)

**<ins>Buscar cuidadores</ins>**
![buscar](docs/screenshots/buscar.png)

**<ins>Solicitar servicio</ins>**
![solicitar](docs/screenshots/solicitar.png)

**<ins>Solicitudes recibidas (cuidador)</ins>**
![solicitudes-cuidador](docs/screenshots/solicitudes-cuidador.png)

**<ins>Registro en vista móvil (responsive, 768px)</ins>**
![registro-movil](docs/screenshots/registro-movil.png)

---

## 📊 Diagramas técnicos

### Arquitectura del frontend

```mermaid
flowchart TD
    subgraph UI["🖼️ Vistas (Vue)"]
        Login[LoginView]
        Register[RegisterView]
        Buscar[BuscarView]
        Perfil[PerfilCuidadorView]
        Solicitar[SolicitarServicioView]
        SolFam[SolicitudesFamiliaView]
        SolCui[SolicitudesCuidadorView]
    end

    subgraph STATE["🗂️ Estado global (Pinia)"]
        AuthStore[authStore]
    end

    subgraph REPO["🔌 Repositories"]
        AuthRepo[AuthRepository]
        CuidadorRepo[CuidadorRepository]
        SolicitudRepo[SolicitudRepository]
    end

    subgraph API["☁️ Backend API"]
        Spring[Spring Boot REST API]
    end

    Login --> AuthRepo
    Register --> AuthRepo
    Buscar --> CuidadorRepo
    Perfil --> CuidadorRepo
    Solicitar --> SolicitudRepo
    SolFam --> SolicitudRepo
    SolCui --> SolicitudRepo

    AuthRepo --> AuthStore
    AuthStore --> UI

    AuthRepo --> Spring
    CuidadorRepo --> Spring
    SolicitudRepo --> Spring

    classDef ui fill:#fff0eb,stroke:#e8734a,stroke-width:2px,color:#333;
    classDef state fill:#eaf4ff,stroke:#3a7bd5,stroke-width:2px,color:#333;
    classDef repo fill:#eafbea,stroke:#2ecc71,stroke-width:2px,color:#333;
    classDef api fill:#f5eaff,stroke:#8e44ad,stroke-width:2px,color:#333;

    class Login,Register,Buscar,Perfil,Solicitar,SolFam,SolCui ui;
    class AuthStore state;
    class AuthRepo,CuidadorRepo,SolicitudRepo repo;
    class Spring api;
```

### Flujo de navegación

```mermaid
flowchart LR
    Start([Usuario entra]) --> Login[LoginView]
    Login -- "no tiene cuenta" --> Register[RegisterView]
    Register --> Login
    Login -- "autenticado" --> Nav[NavBar]

    Nav --> Buscar[BuscarView]
    Nav --> SolFam[SolicitudesFamiliaView]
    Nav --> SolCui[SolicitudesCuidadorView]

    Buscar --> Perfil[PerfilCuidadorView]
    Perfil --> Solicitar[SolicitarServicioView]
    Solicitar --> SolFam

    classDef entry fill:#fff0eb,stroke:#e8734a,stroke-width:2px;
    classDef nav fill:#eaf4ff,stroke:#3a7bd5,stroke-width:2px;
    classDef view fill:#eafbea,stroke:#2ecc71,stroke-width:2px;

    class Start,Login,Register entry;
    class Nav nav;
    class Buscar,SolFam,SolCui,Perfil,Solicitar view;
```

### Casos de uso

| <ins>Visitante</ins> | <ins>Familia</ins> | <ins>Cuidador</ins> |
|---|---|---|
| ![Visitante](docs/diagrams/casos-visitante.png) | ![Familia](docs/diagrams/casos-familia.png) | ![Cuidador](docs/diagrams/casos-cuidador.png) |

### Secuencia: registro y login

![Secuencia registro y login](docs/diagrams/sec1.png)

### Secuencia: solicitar un servicio

![Secuencia solicitud](docs/diagrams/sec2.png)

### Diagrama Entidad-Relación

```mermaid
erDiagram
    USUARIO }o--o{ ROLE : tiene
    USUARIO ||--o| PERFILCUIDADOR : "es (si es cuidador)"
    USUARIO ||--o{ SOLICITUD : "crea (como familia)"
    PERFILCUIDADOR ||--o{ SOLICITUD : "recibe (como cuidador)"
    SOLICITUD ||--o| VALORACION : "recibe"
    SOLICITUD ||--o| PAGO : "genera"

    USUARIO {
        Long id PK
        String nombre
        String email
        String telefono
        String password
    }
    ROLE {
        Long id PK
        String name
    }
    PERFILCUIDADOR {
        Long id PK
        String especialidad
        Integer anosExperiencia
        BigDecimal tarifaHora
        String bio
        boolean tieneVehiculo
        boolean disponibleAhora
        Long usuario_id FK
    }
    SOLICITUD {
        Long id PK
        String tipoCuidado
        String nombrePaciente
        String notas
        Integer edadPaciente
        LocalDate fechaCuidado
        String estado
        Long familia_id FK
        Long cuidador_id FK
    }
    VALORACION {
        Long id PK
        String comentario
        Integer puntuacion
        LocalDate fecha
        Long solicitud_id FK
    }
    PAGO {
        Long id PK
        BigDecimal importe
        String estado
        LocalDate fecha
        Long solicitud_id FK
    }
```

### Diagrama de clases

```mermaid
classDiagram
    class UsuarioEntity {
        -Long id
        -String nombre
        -String email
        -String telefono
        -String password
        -Set~RoleEntity~ roles
    }
    class RoleEntity {
        -Long id
        -String name
    }
    class PerfilCuidadorEntity {
        -Long id
        -String especialidad
        -Integer anosExperiencia
        -BigDecimal tarifaHora
        -String bio
        -boolean tieneVehiculo
        -boolean disponibleAhora
        -UsuarioEntity usuario
    }
    class SolicitudEntity {
        -Long id
        -String tipoCuidado
        -String nombrePaciente
        -String notas
        -Integer edadPaciente
        -LocalDate fechaCuidado
        -EstadoSolicitud estado
        -UsuarioEntity familia
        -PerfilCuidadorEntity cuidador
    }
    class ValoracionEntity {
        -Long id
        -String comentario
        -Integer puntuacion
        -LocalDate fecha
        -SolicitudEntity solicitud
    }
    class PagoEntity {
        -Long id
        -BigDecimal importe
        -EstadoPago estado
        -LocalDate fecha
        -SolicitudEntity solicitud
    }
    class EstadoSolicitud {
        <<enumeration>>
        PENDIENTE
        ACEPTADA
        RECHAZADA
        COMPLETADA
    }
    class EstadoPago {
        <<enumeration>>
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    UsuarioEntity "0..*" -- "0..*" RoleEntity : roles
    UsuarioEntity "1" -- "0..1" PerfilCuidadorEntity : usuario
    UsuarioEntity "1" -- "0..*" SolicitudEntity : familia
    PerfilCuidadorEntity "1" -- "0..*" SolicitudEntity : cuidador
    SolicitudEntity "1" -- "0..1" ValoracionEntity : solicitud
    SolicitudEntity "1" -- "0..1" PagoEntity : solicitud
    SolicitudEntity --> EstadoSolicitud
    PagoEntity --> EstadoPago
```

---

## ✅ Tests

El proyecto tiene **324 tests unitarios** en 32 archivos (Vitest + Vue Test Utils) y **9 tests e2e** (Playwright). Los unitarios mockean el repositorio correspondiente (<mark>vi.spyOn(Repository.prototype, "metodo")</mark>) para no depender de que el backend esté levantado. Los repositorios tienen además sus propios tests, que simulan <mark>fetch</mark> y comprueban la ruta, el método y los errores de cada llamada.

### Tests unitarios

Están en <mark>src/tests/</mark>, con la misma estructura de carpetas que <mark>src/</mark>:

| Carpeta | Qué comprueba | Tests |
|---|---|---|
| 🧱 <mark>components/</mark> | <mark>AppFooter</mark>, <mark>NavBar</mark> (enlaces, avisos, menú de la cuenta, cerrar sesión y visitante), <mark>FotoCuidador</mark> y <mark>SolicitudCard</mark> (incluido el aviso de pagado) | 78 |
| 🍍 <mark>stores/</mark> | <mark>AuthStore</mark> (login, logout, rol activo y foto) | 11 |
| 🧭 <mark>router/</mark> | Rutas privadas, roles y redirecciones | 7 |
| 🛠️ <mark>utils/</mark> | <mark>formatearFecha</mark> y <mark>reducirImagen</mark> | 8 |
| 🔑 <mark>views/auth/</mark> | <mark>LoginView</mark> y <mark>RegisterView</mark> (campos vacíos, acceso correcto y errores del servidor) | 7 |
| 🌍 <mark>views/common/</mark> | <mark>LandingView</mark>, <mark>HistorialView</mark>, <mark>MiPerfilView</mark>, <mark>EditarDatosView</mark>, <mark>CambiarPasswordView</mark> y las páginas legales | 48 |
| 🧑‍⚕️ <mark>views/caregiver/</mark> | <mark>EditarPerfilView</mark> y <mark>SolicitudesCuidadorView</mark> (aceptar, rechazar, errores y foto de perfil) | 33 |
| 👨‍👩‍👧 <mark>views/family/</mark> | <mark>BuscarView</mark> (filtros), <mark>PerfilCuidadorView</mark> (reseñas), <mark>SolicitarServicioView</mark>, <mark>SolicitudesFamiliaView</mark>, <mark>ConfirmacionView</mark>, <mark>CheckoutView</mark> y <mark>ValorarView</mark> | 96 |
| 🔌 <mark>repositories/</mark> | <mark>Repository</mark> (clase base), <mark>UsuarioRepository</mark> y el resto de repositorios (rutas, métodos y errores) | 36 |

```bash
npm run test:unit
```

![Resultado de los tests del frontend](docs/screenshots/tests-frontend.png)

### Cobertura

La cobertura se mide con <mark>@vitest/coverage-v8</mark>. Se genera el informe en la carpeta <mark>coverage/</mark> (abre <mark>coverage/index.html</mark> en el navegador).

```bash
npm run test:coverage
```

Resultado actual: **98 % de líneas**, **98 % de ramas**, **98 % de sentencias** y **97 % de funciones**, por encima del 70 % mínimo que se pedía.

![Cobertura de los tests del frontend](docs/screenshots/cobertura-frontend.png)

### Tests e2e (Playwright)

Los tests e2e abren un navegador de verdad y usan la aplicación completa, así que **necesitan el backend arrancado** (con su base de datos). El frontend lo arranca Playwright si no está en marcha.

- 📝 <mark>registro-login.spec.js</mark> (5): registrarse, iniciar sesión, contraseña incorrecta, email repetido y cerrar sesión.
- 🔄 <mark>flujo-solicitud.spec.js</mark> (1): la familia solicita un servicio, el cuidador lo acepta y la familia paga y ve la confirmación y la solicitud como pagada.
- 👀 <mark>visitante.spec.js</mark> (3): un visitante ve los cuidadores y las rutas privadas lo mandan al login.

```bash
npm run test:e2e
```

![Login e2e](docs/screenshots/e2e-01-login.png)
![Buscar cuidadores e2e](docs/screenshots/e2e-05-buscar.png)

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