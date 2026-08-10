import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const rolActual = ref('familia') // valor de prueba temporal — luego vendrá del login real

  return { rolActual }
})