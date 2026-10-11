import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const id = ref(sessionStorage.getItem("id") || "");
  const email = ref(sessionStorage.getItem("email") || "");
  const rol = ref(sessionStorage.getItem("rol") || "");
  const credenciales = ref(sessionStorage.getItem("credenciales") || "");
  const estaAutenticado = ref(!!sessionStorage.getItem("credenciales"));
  // La foto no se guarda en sessionStorage porque puede ser grande
  const foto = ref("");

  function login(idUsuario, emailUsuario, passwordUsuario, rolUsuario) {
    id.value = idUsuario;
    email.value = emailUsuario;
    rol.value = rolUsuario;
    credenciales.value = btoa(`${emailUsuario}:${passwordUsuario}`);
    estaAutenticado.value = true;

    sessionStorage.setItem("id", idUsuario);
    sessionStorage.setItem("email", emailUsuario);
    sessionStorage.setItem("rol", rolUsuario);
    sessionStorage.setItem("credenciales", credenciales.value);
  }

  function setFoto(nuevaFoto) {
    foto.value = nuevaFoto;
  }

  function logout() {
    id.value = "";
    email.value = "";
    rol.value = "";
    credenciales.value = "";
    estaAutenticado.value = false;
    foto.value = "";

    sessionStorage.removeItem("id");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("rol");
    sessionStorage.removeItem("credenciales");
  }

  return {
    id,
    email,
    rol,
    credenciales,
    estaAutenticado,
    foto,
    login,
    setFoto,
    logout,
  };
});