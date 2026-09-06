import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const id = ref(sessionStorage.getItem('id') || '')
  const email = ref(sessionStorage.getItem('email') || '')
  const rol = ref(sessionStorage.getItem('rol') || '')
  const credenciales = ref(sessionStorage.getItem('credenciales') || '')
  const estaAutenticado = ref(!!sessionStorage.getItem('credenciales'))

  function login(idUsuario, emailUsuario, passwordUsuario, rolUsuario) {
    id.value = idUsuario
    email.value = emailUsuario
    rol.value = rolUsuario
    credenciales.value = btoa(`${emailUsuario}:${passwordUsuario}`)
    estaAutenticado.value = true

    sessionStorage.setItem('id', idUsuario)
    sessionStorage.setItem('email', emailUsuario)
    sessionStorage.setItem('rol', rolUsuario)
    sessionStorage.setItem('credenciales', credenciales.value)
  }

  function logout() {
    id.value = ''
    email.value = ''
    rol.value = ''
    credenciales.value = ''
    estaAutenticado.value = false

    sessionStorage.removeItem('id')
    sessionStorage.removeItem('email')
    sessionStorage.removeItem('rol')
    sessionStorage.removeItem('credenciales')
  }

  return { id, email, rol, credenciales, estaAutenticado, login, logout }
})