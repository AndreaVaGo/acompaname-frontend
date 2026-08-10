<script setup>
import { ref } from "vue";
import SolicitudCard from "../components/SolicitudCard.vue";

const solicitudes = ref([
  {
    id: 1,
    familia: "Familia Serrano",
    paciente: "Antonio Serrano",
    edad: 81,
    tipoCuidado: "Hospitalario",
    fechaInicio: "12 de agosto de 2026",
    notas: "Ingreso previsto de 4 noches en el Hospital La Paz.",
    estado: "pendiente",
  },
  {
    id: 2,
    familia: "Familia Molins",
    paciente: "Carmen Molins",
    edad: 76,
    tipoCuidado: "A domicilio",
    fechaInicio: "18 de agosto de 2026",
    notas: "Apoyo por las mañanas tras una operación de cadera.",
    estado: "pendiente",
  },
]);

function aceptar(id) {
  const solicitud = solicitudes.value.find((s) => s.id === id);
  solicitud.estado = "aceptada";
}

function rechazar(id) {
  const solicitud = solicitudes.value.find((s) => s.id === id);
  solicitud.estado = "rechazada";
}


</script>


