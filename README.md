# Acompáñame - Frontend

Aplicación web tipo marketplace que conecta familias con cuidadores profesionales para el acompañamiento de personas dependientes, tanto en hospitales como a domicilio.

Proyecto Final del Bootcamp de Desarrollo Web Full Stack — Factoría F5.

---

## Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Pantallas implementadas](#pantallas-implementadas)
- [Decisiones técnicas](#decisiones-técnicas)
- [Metodología de trabajo](#metodología-de-trabajo)
- [Instalación y uso](#instalación-y-uso)
- [Enlaces del proyecto](#enlaces-del-proyecto)
- [Próximos pasos](#próximos-pasos)
- [Autora](#autora)

---

## Descripción del proyecto

Acompáñame nace de una necesidad real: encontrar cuidadores de confianza para personas dependientes, ya sea durante un ingreso hospitalario o en el propio domicilio, sin depender de llamadas interminables ni de gestiones poco transparentes.

La plataforma funciona como un marketplace con dos roles claramente diferenciados:

- **Familia**: busca cuidadores filtrando por tipo de cuidado, disponibilidad y otras características (como disponer de vehículo propio), consulta perfiles con valoraciones reales de otras familias, envía solicitudes de servicio y valora al cuidador una vez finalizado el acompañamiento.
- **Cuidador**: publica y edita su perfil profesional (especialidad, tarifa, disponibilidad), recibe solicitudes de familias y decide si las acepta o las rechaza según su disponibilidad real.

Este repositorio contiene exclusivamente el **frontend** de la aplicación, desarrollado en Vue 3. El backend (API REST con Spring Boot y Spring Security) se encuentra en un repositorio independiente, siguiendo un enfoque desacoplado entre ambas partes.

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| **Vue 3** | Framework principal, usando la Composition API con `<script setup>` |
| **Vue Router** | Navegación entre las 13 vistas de la aplicación, incluyendo rutas con parámetros dinámicos (`/cuidador/:id`) |
| **Pinia** | Gestión de estado compartido (rol de usuario activo) entre componentes |
| **Vite** | Entorno de desarrollo con recarga en caliente (HMR) y build de producción |
| **CSS nativo** | Sin frameworks de estilos externos; metodología **BEM** y **variables CSS globales** (`:root`) para mantener consistencia visual |

## Arquitectura del proyecto

\```
acompaname-frontend/
├── public/
├── src/
│   ├── assets/            # Imágenes del proyecto
│   ├── components/
│   │   ├── NavBar.vue      # Navegación compartida entre vistas
│   │   └── SolicitudCard.vue  # Tarjeta de solicitud, reutilizada en las vistas de Familia y Cuidador
│   ├── pinia/
│   │   └── index.js         # Instancia de Pinia
│   ├── stores/
│   │   └── auth.js          # Store con el rol de usuario activo
│   ├── router/
│   │   └── index.js         # Definición de todas las rutas
│   ├── styles/
│   │   ├── variables.css    # Paleta de colores, radios, sombras, espaciados
│   │   └── base.css         # Estilos compartidos (botones)
│   ├── views/               # Una vista por pantalla completa
│   ├── App.vue               # Componente raíz (NavBar + RouterView)
│   └── main.js
├── index.html
└── package.json
\```

Esta estructura separa claramente responsabilidades: las **vistas** (`views/`) representan pantallas completas, los **componentes** (`components/`) contienen piezas reutilizables entre vistas, el **store** (`stores/`) centraliza el estado compartido, y los **estilos globales** (`styles/`) evitan duplicar valores de diseño (colores, espaciados) en cada archivo.

## Pantallas implementadas

1. **Landing** — página pública de bienvenida, con propuesta de valor y accesos a registro/login
2. **Registro** — formulario con selección de rol (Familia / Cuidador)
3. **Inicio de sesión**
4. **Búsqueda de cuidadores** — listado con filtros por tipo de cuidado, disponibilidad y vehículo propio
5. **Perfil de cuidador** (vista pública) — datos profesionales, valoración media y reseñas de familias
6. **Solicitud de servicio** — formulario para pedir el acompañamiento a un cuidador concreto
7. **Confirmación de solicitud**
8. **Historial de solicitudes** (Familia) — estado final de cada acompañamiento gestionado, con acceso a valorar
9. **Solicitudes enviadas** (Familia) — estado de las solicitudes que ha enviado a distintos cuidadores
10. **Formulario de valoración** — puntuación de 1 a 5 estrellas y comentario
11. **Solicitudes recibidas** (Cuidador) — gestión de aceptar/rechazar
12. **Edición de perfil de cuidador**
13. **Mi perfil** (Familia)

Cada vista incluye sus correspondientes estados vacíos (por ejemplo, "Aún no tienes solicitudes") para que la interfaz nunca se muestre rota cuando no hay datos disponibles.

## Decisiones técnicas

**BEM + variables CSS globales.** Se adoptó esta convención de nomenclatura (`bloque__elemento--modificador`) junto con variables centralizadas en `:root` para los colores, radios de borde, sombras y espaciados. Esto evita repetir valores sueltos por todo el proyecto y facilita que un cambio de diseño (por ejemplo, el color de acento) se propague automáticamente a las 13 vistas sin tener que editarlas una a una.

**Componente `NavBar` compartido.** En lugar de repetir la navegación en cada vista, se extrajo a un único componente incluido en `App.vue`, que muestra distintos enlaces según el rol del usuario (Familia ve "Buscar", Cuidador no) y oculta el menú por completo en pantallas donde no hay sesión iniciada (Landing, Login, Registro).

**Estado compartido con Pinia.** El rol de usuario activo (Familia o Cuidador) se gestiona en un store (`useAuthStore`) en lugar de vivir como una variable local en `NavBar.vue`. Esto permite que cualquier vista, no solo la navegación, pueda consultar y reaccionar al rol actual — por ejemplo, ocultando el botón "Solicitar servicio" en el perfil de un cuidador cuando quien lo visualiza es otro cuidador, no una familia.

**Componente `SolicitudCard` reutilizable.** La tarjeta que muestra una solicitud (familia/cuidador, tipo de cuidado, fecha, notas y estado) se repetía casi de forma idéntica en las vistas de "Solicitudes recibidas" y "Solicitudes enviadas", con la única diferencia de mostrar o no los botones de Aceptar/Rechazar. Se extrajo a un componente único que recibe esos datos por *props*, evitando duplicar el HTML y el CSS en dos archivos.

**Validación básica de formularios.** Los formularios de Login, Registro y Solicitud de servicio comprueban que los campos obligatorios no estén vacíos antes de continuar, mostrando un mensaje de error visible en caso contrario. Como todavía no hay backend, esta validación es puramente de cliente (JavaScript), a la espera de la validación adicional que aportará la API REST.

**Datos simulados (mock) en cada vista.** Como el desarrollo del frontend se inició antes de que el backend con Spring Boot estuviera disponible en el temario del bootcamp, cada vista trabaja con datos de ejemplo definidos directamente en su `<script setup>` mediante `ref()`. Esta decisión permitió avanzar el frontend en paralelo sin bloquear el proyecto, y la sustitución por llamadas reales a la API REST se hará sin cambios estructurales, ya que la lógica de renderizado (`v-for`, `v-if`, interpolación) es independiente del origen de los datos.

**Reactividad e interactividad real.** Varias vistas ya incluyen lógica funcional más allá de la maqueta visual: el cambio de estado de una solicitud (Aceptar/Rechazar) actualiza la interfaz al instante gracias a `ref()`, el selector de rol en el registro usa *class binding* dinámico (`:class`), y el selector de estrellas en la valoración es completamente interactivo.

**Diseño responsive con media queries.** Todas las vistas incluyen ajustes para pantallas móviles (principalmente en el punto de corte de 768px), transformando disposiciones en columnas (grid, flex en fila) a disposiciones apiladas verticales, y reduciendo espaciados para aprovechar mejor el espacio disponible.

## Metodología de trabajo

El desarrollo siguió un enfoque iterativo: primero se construyó la estructura HTML de cada vista, después se aplicaron los estilos comparando visualmente con el prototipo de diseño, y finalmente se refactorizó el CSS a BEM con variables globales una vez validado el resultado visual, para evitar rehacer trabajo si el diseño cambiaba durante el proceso.

La gestión del proyecto se organizó en JIRA con épicas, historias de usuario redactadas con criterios de aceptación en formato Gherkin (Given/When/Then) y reparto en sprints. El control de versiones se llevó con commits descriptivos en inglés, agrupados por unidad funcional (una vista, un bloque de responsive, un refactor concreto).

## Instalación y uso

\```bash
# Clonar el repositorio
git clone https://github.com/AndreaVaGo/acompaname-frontend.git

# Entrar en la carpeta del proyecto
cd acompaname-frontend

# Instalar las dependencias
npm install

# Arrancar el servidor de desarrollo
npm run dev
\```

La aplicación quedará disponible en `http://localhost:5173`.

## Enlaces del proyecto

- **Repositorio backend**: *(pendiente)*
- **Gestión del proyecto (JIRA)**: *(pendiente)*
- **Prototipo de diseño (Lovable)**: *(pendiente)*
- **Diagramas técnicos**: `assets/diagrama-er-acompaname.png` · `assets/diagrama-clases-acompaname.png`
- **Presentación**: *(pendiente)*

## Próximos pasos

- Conexión con la API REST del backend (Spring Boot), sustituyendo los datos simulados por peticiones reales
- Autenticación de usuarios real y protección de rutas según el rol
- Persistencia de sesión

## Autora

Andrea — Proyecto Final, Bootcamp Desarrollo Web Full Stack, Factoría F5.