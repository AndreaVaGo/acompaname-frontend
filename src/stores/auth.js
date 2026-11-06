import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const id = ref(sessionStorage.getItem("id") || "");
  const email = ref(sessionStorage.getItem("email") || "");
  const rol = ref(sessionStorage.getItem("rol") || "");
  // El token lo da el servidor al iniciar sesión. Ya no se guarda la contraseña
  const token = ref(sessionStorage.getItem("token") || "");
  const estaAutenticado = ref(!!sessionStorage.getItem("token"));
  // La foto no se guarda en sessionStorage porque puede ser grande
  const foto = ref("");

  function login(idUsuario, emailUsuario, tokenUsuario, rolUsuario) {
    id.value = idUsuario;
    email.value = emailUsuario;
    rol.value = rolUsuario;
    token.value = tokenUsuario;
    estaAutenticado.value = true;

    sessionStorage.setItem("id", idUsuario);
    sessionStorage.setItem("email", emailUsuario);
    sessionStorage.setItem("rol", rolUsuario);
    sessionStorage.setItem("token", tokenUsuario);
  }

  // El token lleva el id de la persona, no el email, así que al cambiar
  // el email la sesión sigue valiendo: solo hay que actualizar el email guardado
  function actualizarEmail(emailNuevo) {
    email.value = emailNuevo;
    sessionStorage.setItem("email", emailNuevo);
  }

  function setFoto(nuevaFoto) {
    foto.value = nuevaFoto;
  }

  function logout() {
    id.value = "";
    email.value = "";
    rol.value = "";
    token.value = "";
    estaAutenticado.value = false;
    foto.value = "";

    sessionStorage.removeItem("id");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("rol");
    sessionStorage.removeItem("token");
  }

  return {
    id,
    email,
    rol,
    token,
    estaAutenticado,
    foto,
    login,
    actualizarEmail,
    setFoto,
    logout,
  };
});