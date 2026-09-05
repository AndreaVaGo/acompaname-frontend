import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const email = ref(sessionStorage.getItem('email') || '')
  const rol = ref(sessionStorage.getItem('rol') || '')
  const credenciales = ref(sessionStorage.getItem('credenciales') || '')
  const estaAutenticado = ref(!!sessionStorage.getItem('credenciales'))

  function login(emailUsuario, passwordUsuario, rolUsuario) {
    email.value = emailUsuario
    rol.value = rolUsuario
    credenciales.value = btoa(`${emailUsuario}:${passwordUsuario}`)
    estaAutenticado.value = true

    sessionStorage.setItem('email', emailUsuario)
    sessionStorage.setItem('rol', rolUsuario)
    sessionStorage.setItem('credenciales', credenciales.value)
  }

  function logout() {
    email.value = ''
    rol.value = ''
    credenciales.value = ''
    estaAutenticado.value = false

    sessionStorage.removeItem('email')
    sessionStorage.removeItem('rol')
    sessionStorage.removeItem('credenciales')
  }

  return { email, rol, credenciales, estaAutenticado, login, logout }
})