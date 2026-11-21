<script setup>
import { ref, computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";
import { formatearFecha } from "@/utils/formatearFecha";
import { nombreTipo, colorTipo } from "@/utils/nombreTipo";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";
import AdminCabeceraOrden from "@/components/admin/AdminCabeceraOrden.vue";
import AdminOrdenar from "@/components/admin/AdminOrdenar.vue";
import { ordenarFilas, siguienteOrden } from "@/utils/ordenarTabla";

// Tabla de pagos con botones de estado (el filtro lo hace el servidor, cada botón lleva el color
// de su píldora) y buscador por familia o cuidador (lo hace el propio componente).
// estado es lo que está elegido en el filtro ("" = todos).
const props = defineProps({
  pagos: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

// Cada estado lleva el color de su píldora
const ESTADOS = [
  { valor: "", nombre: "Todos", color: "neutro" },
  { valor: "PENDIENTE", nombre: "Pendiente", color: "naranja" },
  { valor: "COMPLETADO", nombre: "Cobrado", color: "verde" },
  { valor: "CANCELADO", nombre: "Cancelado", color: "gris" },
];

const busqueda = ref("");

// Los pagos que coinciden con lo escrito en el buscador (sin mirar mayúsculas)
const pagosMostrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (texto === "") {
    return props.pagos;
  }
  return props.pagos.filter((pago) => {
    return (
      pago.nombreFamilia.toLowerCase().includes(texto) ||
      pago.nombreCuidador.toLowerCase().includes(texto)
    );
  });
});

// Orden de la tabla: por qué columna y en qué sentido ("" = como llegan del servidor)
const orden = ref({ clave: "", direccion: "asc" });

const COLUMNAS = [
  { clave: "familia", nombre: "Familia" },
  { clave: "cuidador", nombre: "Persona cuidadora" },
  { clave: "tipo", nombre: "Tipo" },
  { clave: "importe", nombre: "Importe" },
  { clave: "fecha", nombre: "Fecha" },
  { clave: "sinCobrar", nombre: "Sin cobrar" },
  { clave: "estado", nombre: "Estado" },
];

// Cómo sacar de un pago el valor de cada columna.
// Los días sin cobrar solo existen en los pendientes: el resto quedan siempre al final.
const VALORES = {
  familia: (pago) => pago.nombreFamilia,
  cuidador: (pago) => pago.nombreCuidador,
  tipo: (pago) => nombreTipo(pago.tipoCuidado),
  importe: (pago) => pago.importe,
  fecha: (pago) => pago.fecha,
  sinCobrar: (pago) => (pago.estado === "PENDIENTE" ? pago.diasDesdeCreacion : null),
  estado: (pago) => ESTADOS.findIndex((opcion) => opcion.valor === pago.estado),
};

const pagosOrdenados = computed(() => ordenarFilas(pagosMostrados.value, VALORES, orden.value));

function cambiarOrden(clave) {
  orden.value = siguienteOrden(orden.value, clave);
}

const totalMostrado = computed(() => {
  let suma = 0;
  for (const pago of pagosMostrados.value) {
    suma = suma + pago.importe;
  }
  return suma;
});

// Color de la píldora del estado (el mismo que el de su botón del filtro)
function colorEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.color;
    }
  }
  return "gris";
}

function nombreEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.nombre;
    }
  }
  return estado;
}

// Solo los pagos pendientes tienen días sin cobrar
function diasSinCobrar(pago) {
  if (pago.estado !== "PENDIENTE") {
    return "—";
  }
  if (pago.diasDesdeCreacion === 1) {
    return "1 día";
  }
  return pago.diasDesdeCreacion + " días";
}

// Mismo criterio que el aviso del panel: pendiente desde hace más de una semana
function estaRetrasado(pago) {
  return pago.estado === "PENDIENTE" && pago.diasDesdeCreacion > 7;
}

// Color de los días sin cobrar: rojo si se retrasa, naranja si está pendiente y gris si no aplica
function claseDias(pago) {
  if (estaRetrasado(pago)) {
    return "admin-pagos-tabla__dias--retrasado";
  }
  if (pago.estado === "PENDIENTE") {
    return "admin-pagos-tabla__dias--pendiente";
  }
  return "admin-pagos-tabla__dias--ninguno";
}

function textoPagos(cantidad) {
  if (cantidad === 1) {
    return "1 pago";
  }
  return cantidad + " pagos";
}
</script>

<template>
  <section class="admin-pagos-tabla admin-panel">
    <div class="admin-pagos-tabla__cabecera">
      <h2 class="admin-pagos-tabla__titulo">Detalle de pagos</h2>

      <input
        v-model="busqueda"
        type="search"
        class="admin-pagos-tabla__buscador"
        placeholder="Buscar por familia o persona cuidadora"
        aria-label="Buscar por familia o persona cuidadora"
      />
    </div>

    <AdminFiltros
      :opciones="ESTADOS"
      :elegido="estado"
      etiqueta="Filtrar por estado"
      @elegir="emit('cambiarEstado', $event)"
    />

    <p v-if="pagos.length === 0" class="admin-pagos-tabla__vacio">
      No hay pagos con este estado.
    </p>
    <p v-else-if="pagosMostrados.length === 0" class="admin-pagos-tabla__vacio">
      Ningún pago coincide con la búsqueda.
    </p>

    <template v-else>
      <AdminOrdenar :columnas="COLUMNAS" :orden="orden" @ordenar="cambiarOrden" />

      <div class="admin-tabla">
        <table>
          <thead>
            <tr>
              <AdminCabeceraOrden
                v-for="columna in COLUMNAS"
                :key="columna.clave"
                :etiqueta="columna.nombre"
                :clave="columna.clave"
                :orden="orden"
                @ordenar="cambiarOrden"
              />
            </tr>
          </thead>
          <tbody>
            <tr v-for="pago in pagosOrdenados" :key="pago.id">
              <td data-label="Familia">{{ pago.nombreFamilia }}</td>
              <td data-label="Persona cuidadora">{{ pago.nombreCuidador }}</td>
              <td data-label="Tipo">
                <AdminPildora :color="colorTipo(pago.tipoCuidado)">
                  {{ nombreTipo(pago.tipoCuidado) }}
                </AdminPildora>
              </td>
              <td data-label="Importe" class="admin-pagos-tabla__importe">
                {{ formatearEuros(pago.importe) }}
              </td>
              <td data-label="Fecha">
                <span class="admin-pagos-tabla__fecha">{{ formatearFecha(pago.fecha) }}</span>
              </td>
              <td
                data-label="Sin cobrar"
                :class="{ 'admin-pagos-tabla__retrasado': estaRetrasado(pago) }"
              >
                <span class="admin-pagos-tabla__dias" :class="claseDias(pago)">
                  {{ diasSinCobrar(pago) }}
                </span>
              </td>
              <td data-label="Estado">
                <AdminPildora :color="colorEstado(pago.estado)" punto>
                  {{ nombreEstado(pago.estado) }}
                </AdminPildora>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="admin-pagos-tabla__pie">
        {{ textoPagos(pagosMostrados.length) }} · Total {{ formatearEuros(totalMostrado) }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.admin-pagos-tabla {
  padding: 24px;
  /* El cristal viene de la clase global admin-panel; aquí solo el color de la sección */
  --admin-color: var(--color-secondary);
}

.admin-pagos-tabla__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-pagos-tabla__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__buscador {
  min-width: 240px;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.95rem;
  background-color: var(--color-white);
}


.admin-pagos-tabla__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-pagos-tabla__pie {
  margin: 14px 0 0;
  text-align: right;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

/* Importe en negrita */
.admin-pagos-tabla__importe {
  font-weight: bold;
}

/* Fecha en una pastilla suave y en negrita */
.admin-pagos-tabla__fecha {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-input);
  background-color: color-mix(in srgb, var(--admin-color) 12%, white);
  font-weight: bold;
}

/* Sin cobrar: rojo si se retrasa (más de 7 días), naranja si está pendiente y gris si no aplica */
.admin-pagos-tabla__dias {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;
}

.admin-pagos-tabla__dias--retrasado {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
}

.admin-pagos-tabla__dias--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.admin-pagos-tabla__dias--ninguno {
  padding: 4px 0;
  color: var(--color-text-muted);
}

/* En el móvil el buscador ocupa todo el ancho */
@media (max-width: 640px) {
  .admin-pagos-tabla__buscador {
    min-width: 0;
    width: 100%;
  }
}
</style>