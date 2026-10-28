<script setup>
import { ref, onMounted } from "vue";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import FotoCuidador from "@/components/FotoCuidador.vue";
import SelectorGrupos from "@/components/SelectorGrupos.vue";
import { reducirImagen } from "@/utils/reducirImagen";
import { CUIDADOS } from "@/utils/catalogoCuidados";
import { useAuthStore } from "@/stores/auth";
import { mensajeDeError } from "@/utils/mensajeDeError";

const cuidadorRepository = new CuidadorRepository();
const authStore = useAuthStore();

const perfil = ref(null);
const especialidad = ref("");
const ciudad = ref("");
const tipoCuidado = ref("ambos");
const sexo = ref("");
const servicios = ref([]);
const gruposEdad = ref([]);
const anosExperiencia = ref(0);
const tarifaHora = ref(0);
const bio = ref("");
const foto = ref("");
const tieneVehiculo = ref(false);
const disponibleAhora = ref(false);

const cargando = ref(true);
const error = ref("");
const guardado = ref(false);

onMounted(async () => {
  try {
    perfil.value = await cuidadorRepository.getMiPerfil();
    especialidad.value = perfil.value.especialidad;
    ciudad.value = perfil.value.ciudad || "";
    tipoCuidado.value = perfil.value.tipoCuidado || "ambos";
    sexo.value = perfil.value.sexo || "";
    servicios.value = perfil.value.servicios || [];
    gruposEdad.value = perfil.value.gruposEdad || [];
    anosExperiencia.value = perfil.value.anosExperiencia;
    tarifaHora.value = perfil.value.tarifaHora;
    bio.value = perfil.value.bio;
    foto.value = perfil.value.foto || "";
    tieneVehiculo.value = perfil.value.tieneVehiculo;
    disponibleAhora.value = perfil.value.disponibleAhora;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar tu perfil.");
  } finally {
    cargando.value = false;
  }
});

async function elegirFoto(evento) {
  const archivo = evento.target.files[0];
  if (!archivo) {
    return;
  }
  if (!archivo.type.startsWith("image/")) {
    error.value = "Elige un archivo de imagen.";
    return;
  }

  try {
    foto.value = await reducirImagen(archivo);
    error.value = "";
  } catch (err) {
    error.value = "No se pudo cargar la imagen.";
  }
}

function quitarFoto() {
  foto.value = "";
}

async function guardar() {
  guardado.value = false;

  if (!especialidad.value.trim() || !bio.value.trim()) {
    error.value = "Rellena la especialidad y la descripción.";
    return;
  }
  if (Number(anosExperiencia.value) < 0) {
    error.value = "Los años de experiencia no pueden ser negativos.";
    return;
  }
  if (!(Number(tarifaHora.value) > 0)) {
    error.value = "La tarifa por hora debe ser mayor que 0.";
    return;
  }
  error.value = "";

  try {
    await cuidadorRepository.update(perfil.value.id, {
      especialidad: especialidad.value.trim(),
      anosExperiencia: Number(anosExperiencia.value),
      tarifaHora: Number(tarifaHora.value),
      bio: bio.value.trim(),
      tieneVehiculo: tieneVehiculo.value,
      disponibleAhora: disponibleAhora.value,
      usuarioId: perfil.value.usuarioId,
      foto: foto.value.trim() || null,
      ciudad: ciudad.value.trim() || null,
      tipoCuidado: tipoCuidado.value,
      servicios: servicios.value,
      gruposEdad: gruposEdad.value,
      // Vacío = prefiero no indicarlo (el back lo borra)
      sexo: sexo.value,
    });
    // Así el círculo del menú de arriba cambia al momento
    authStore.setFoto(foto.value);
    guardado.value = true;
    // Subimos arriba para que se vea el mensaje de guardado
    window.scrollTo(0, 0);
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo guardar tu perfil.");
  }
}
</script>

<template>
  <div class="editar">
    <div class="editar__wrapper">
      <h1>Mi perfil profesional</h1>
      <p class="editar__subtitle">
        Esto es lo que verán las familias cuando busquen una persona cuidadora.
      </p>

      <p v-if="guardado" class="editar__ok">Perfil guardado correctamente.</p>

      <div class="editar__box">
        <p v-if="cargando" class="editar__cargando">Cargando tu perfil...</p>

        <form v-if="perfil" class="editar__form" @submit.prevent="guardar">
          <!-- Franja de color con la foto y los botones para cambiarla -->
          <div class="editar__foto">
            <FotoCuidador
              :foto="foto"
              :nombre="perfil.usuarioNombre"
              :tamano="96"
            />
            <div class="editar__foto-campo">
              <label for="foto">Foto de perfil</label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                @change="elegirFoto"
              />
              <p class="editar__ayuda">
                Elige una imagen de tu ordenador. Si no pones ninguna, se
                mostrará un monigote.
              </p>
              <button
                v-if="foto"
                type="button"
                id="quitar-foto"
                class="editar__quitar"
                @click="quitarFoto"
              >
                Quitar foto
              </button>
            </div>
          </div>

          <div class="editar__cuerpo">
            <h2 class="editar__seccion">Datos profesionales</h2>

            <div class="editar__row">
              <div>
                <label for="especialidad">Especialidad</label>
                <input
                  type="text"
                  id="especialidad"
                  v-model="especialidad"
                  maxlength="100"
                  placeholder="Geriatría, acompañamiento hospitalario..."
                />
              </div>
              <div>
                <label for="ciudad">Ciudad</label>
                <input
                  type="text"
                  id="ciudad"
                  v-model="ciudad"
                  maxlength="100"
                  placeholder="Oviedo, Gijón, Madrid..."
                />
              </div>
            </div>

            <div class="editar__row">
              <div>
                <label for="sexo">Sexo (opcional)</label>
                <select id="sexo" v-model="sexo">
                  <option value="">Prefiero no indicarlo</option>
                  <option value="MUJER">Mujer</option>
                  <option value="HOMBRE">Hombre</option>
                </select>
              </div>
              <div>
                <label for="tipo-cuidado">Tipo de cuidado</label>
                <select id="tipo-cuidado" v-model="tipoCuidado">
                  <option value="hospitalario">Hospitalario</option>
                  <option value="domicilio">A domicilio</option>
                  <option value="ambos">Ambos (hospital y domicilio)</option>
                </select>
              </div>
            </div>

            <h2 class="editar__seccion">Personas a las que cuidas</h2>
            <p class="editar__ayuda">
              Marca los grupos de edad a los que puedes cuidar. Las familias
              podrán encontrarte al buscar por grupo.
            </p>
            <div class="editar__grupos">
              <SelectorGrupos
                v-model="gruposEdad"
                multiple
                ocultar-legend
                legend="Grupos de edad a los que cuidas"
                name="grupos-edad"
              />
            </div>

            <h2 class="editar__seccion">
              Servicios en los que tienes experiencia
            </h2>
            <div class="editar__servicios">
              <label
                v-for="servicio in CUIDADOS"
                :key="servicio.codigo"
                class="editar__check"
                :class="{
                  'editar__check--marcado': servicios.includes(
                    servicio.codigo,
                  ),
                }"
              >
                <input
                  type="checkbox"
                  :id="'servicio-' + servicio.codigo"
                  :value="servicio.codigo"
                  v-model="servicios"
                />
                {{ servicio.nombre }}
              </label>
            </div>

            <h2 class="editar__seccion">Experiencia y tarifa</h2>
            <div class="editar__row">
              <div>
                <label for="anos">Años de experiencia</label>
                <input
                  type="number"
                  id="anos"
                  v-model="anosExperiencia"
                  min="0"
                />
              </div>
              <div>
                <label for="tarifa">Tarifa por hora (€)</label>
                <input
                  type="number"
                  id="tarifa"
                  v-model="tarifaHora"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <label for="bio">Sobre ti</label>
            <textarea
              id="bio"
              v-model="bio"
              maxlength="1000"
              placeholder="Cuéntales tu experiencia y cómo trabajas..."
            ></textarea>

            <h2 class="editar__seccion">Disponibilidad</h2>
            <div class="editar__opciones">
              <label
                class="editar__check"
                :class="{ 'editar__check--marcado': tieneVehiculo }"
              >
                <input type="checkbox" id="vehiculo" v-model="tieneVehiculo" />
                Tengo vehículo propio
              </label>

              <label
                class="editar__check"
                :class="{ 'editar__check--marcado': disponibleAhora }"
              >
                <input
                  type="checkbox"
                  id="disponible"
                  v-model="disponibleAhora"
                />
                Disponible ahora
              </label>
            </div>

            <p v-if="error" class="editar__error">{{ error }}</p>

            <button type="submit" class="btn btn--primary">
              Guardar perfil
            </button>
          </div>
        </form>

        <p v-if="error && !perfil" class="editar__error editar__error--suelto">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editar {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  justify-content: center;
  padding: var(--gap-lg) 20px;
}

.editar__wrapper {
  max-width: 760px;
  width: 100%;
}

.editar h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.editar__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

.editar__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.editar__cargando {
  padding: 24px 32px;
}

.editar__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  & input[type="text"],
  & input[type="number"],
  & select,
  & textarea {
    padding: 12px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: var(--gap-md);
    font-size: 1rem;
    font-family: inherit;
  }

  & input[type="text"]:focus,
  & input[type="number"]:focus,
  & select:focus,
  & textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-bg);
  }

  /* Los textos de ejemplo van en cursiva para distinguirlos de lo escrito */
  & input::placeholder,
  & textarea::placeholder {
    color: var(--color-text-muted);
    font-style: italic;
  }

  & select {
    background-color: var(--color-white);
  }

  & textarea {
    min-height: 120px;
    resize: vertical;
  }

  /* Dentro del formulario para ganar a la regla "label" de arriba (negrita) */
  & .editar__check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: normal;
    font-size: 0.95rem;
    margin-bottom: var(--gap-sm);
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    background-color: var(--color-white);
    cursor: pointer;
  }

  & .editar__check:hover {
    border-color: var(--color-accent);
  }

  & .editar__check--marcado {
    border-color: var(--color-accent);
    background-color: var(--color-accent-bg);
    font-weight: bold;
  }

  & .editar__check input[type="checkbox"] {
    accent-color: var(--color-accent);
    width: 16px;
    height: 16px;
  }

  & .btn {
    padding: 14px;
  }
}

/* Franja de color con la foto, hasta los bordes de la tarjeta */
.editar__foto {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 28px 32px;
  background-color: var(--color-accent-bg);
}

.editar__foto-campo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* El texto de ayuda va sencillo, en gris suave y con una bombilla delante */
.editar__ayuda {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: 8px 0;

  &::before {
    content: "💡 ";
  }
}

.editar__quitar {
  align-self: flex-start;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  padding: 6px 12px;
}

.editar__cuerpo {
  display: flex;
  flex-direction: column;
  padding: 28px 32px 32px;
}

/* Cada bloque del formulario lleva su título en coral, con un icono y una línea debajo */
.editar__seccion {
  font-size: 1.15rem;
  color: var(--color-accent-dark);
  margin: 12px 0 18px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);

  &::before {
    margin-right: 8px;
  }
}

.editar__seccion:nth-of-type(1)::before {
  content: "📋";
}

.editar__seccion:nth-of-type(2)::before {
  content: "👥";
}

.editar__seccion:nth-of-type(3)::before {
  content: "🩺";
}

.editar__seccion:nth-of-type(4)::before {
  content: "⭐";
}

.editar__seccion:nth-of-type(5)::before {
  content: "📅";
}

.editar__cuerpo > .editar__seccion:first-child {
  margin-top: 0;
}

.editar__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;

  & > div {
    display: flex;
    flex-direction: column;
  }
}

.editar__grupos {
  margin-bottom: var(--gap-md);
}

.editar__servicios {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 var(--gap-sm);
  margin-bottom: var(--gap-md);
}

.editar__opciones {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 var(--gap-sm);
  margin-bottom: var(--gap-sm);
}

.editar__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 8px 0 16px;
}

.editar__error--suelto {
  margin: 24px 32px;
}

.editar__ok {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

@media (max-width: 768px) {
  .editar__foto {
    flex-direction: column;
    padding: 20px;
  }

  .editar__foto-campo {
    width: 100%;
  }

  .editar__cuerpo {
    padding: 20px;
  }

  .editar__row {
    grid-template-columns: 1fr;
  }

  .editar__servicios,
  .editar__opciones {
    grid-template-columns: 1fr;
  }

  .editar__error--suelto {
    margin: 20px;
  }
}
</style>