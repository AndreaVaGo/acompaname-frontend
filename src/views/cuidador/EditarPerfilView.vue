<script setup>
import { ref, onMounted } from "vue";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import FotoCuidador from "@/components/FotoCuidador.vue";
import { reducirImagen } from "@/utils/reducirImagen";
import { useAuthStore } from "@/stores/auth";

const cuidadorRepository = new CuidadorRepository();
const authStore = useAuthStore();

const perfil = ref(null);
const especialidad = ref("");
const ciudad = ref("");
const tipoCuidado = ref("ambos");
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
    anosExperiencia.value = perfil.value.anosExperiencia;
    tarifaHora.value = perfil.value.tarifaHora;
    bio.value = perfil.value.bio;
    foto.value = perfil.value.foto || "";
    tieneVehiculo.value = perfil.value.tieneVehiculo;
    disponibleAhora.value = perfil.value.disponibleAhora;
  } catch (err) {
    error.value = "No se pudo cargar tu perfil.";
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
    });
    // Así el círculo del menú de arriba cambia al momento
    authStore.setFoto(foto.value);
    guardado.value = true;
  } catch (err) {
    error.value = "No se pudo guardar tu perfil. Revisa los datos.";
  }
}
</script>

<template>
  <div class="editar">
    <div class="editar__box">
      <h1>Mi perfil profesional</h1>
      <p class="editar__subtitle">
        Esto es lo que verán las familias cuando busquen cuidador.
      </p>

      <p v-if="cargando">Cargando tu perfil...</p>

      <form v-if="perfil" class="editar__form" @submit.prevent="guardar">
        <div class="editar__foto">
          <FotoCuidador
            :foto="foto"
            :nombre="perfil.usuarioNombre"
            :tamano="80"
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

        <label for="especialidad">Especialidad</label>
        <input
          type="text"
          id="especialidad"
          v-model="especialidad"
          maxlength="100"
          placeholder="Geriatría, acompañamiento hospitalario..."
        />

        <label for="ciudad">Ciudad</label>
        <input
          type="text"
          id="ciudad"
          v-model="ciudad"
          maxlength="100"
          placeholder="Oviedo, Gijón, Madrid..."
        />

        <label for="tipo-cuidado">Tipo de cuidado</label>
        <select id="tipo-cuidado" v-model="tipoCuidado">
          <option value="hospitalario">Hospitalario</option>
          <option value="domicilio">A domicilio</option>
          <option value="ambos">Ambos (hospital y domicilio)</option>
        </select>

        <div class="editar__row">
          <div>
            <label for="anos">Años de experiencia</label>
            <input type="number" id="anos" v-model="anosExperiencia" min="0" />
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

        <label class="editar__check">
          <input type="checkbox" id="vehiculo" v-model="tieneVehiculo" />
          Tengo vehículo propio
        </label>

        <label class="editar__check">
          <input type="checkbox" id="disponible" v-model="disponibleAhora" />
          Disponible ahora
        </label>

        <p v-if="error" class="editar__error">{{ error }}</p>
        <p v-if="guardado" class="editar__ok">Perfil guardado correctamente.</p>

        <button type="submit" class="btn btn--primary">Guardar perfil</button>
      </form>

      <p v-if="error && !perfil" class="editar__error">{{ error }}</p>
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

.editar__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 32px;
  max-width: 520px;
  width: 100%;
  height: fit-content;
  box-shadow: var(--shadow-card);
}

.editar h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.editar__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.editar__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
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

  & select {
    background-color: var(--color-white);
  }

  & textarea {
    min-height: 120px;
    resize: vertical;
  }
}

.editar__foto {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: var(--gap-sm);
}

.editar__foto-campo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editar__ayuda {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin: 8px 0;
}

.editar__quitar {
  align-self: flex-start;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  padding: 6px 12px;
}

.editar__row {
  display: flex;
  gap: var(--gap-sm);

  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.editar__check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  margin-bottom: var(--gap-sm);
}

.editar__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 8px 0 16px;
}

.editar__ok {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 8px 0 16px;
}

@media (max-width: 768px) {
  .editar__box {
    padding: 24px;
  }

  .editar__row {
    flex-direction: column;
  }

  .editar__foto {
    flex-direction: column;
    align-items: center;
  }

  .editar__foto-campo {
    width: 100%;
  }
}
</style>