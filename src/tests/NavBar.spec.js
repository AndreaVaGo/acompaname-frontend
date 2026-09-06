import { describe, test, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

describe('NavBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('muestra el enlace Buscar cuando el rol es familia', () => {
    const authStore = useAuthStore()
    authStore.login('ana@test.com', '12345678', 'FAMILIA')

    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Buscar')
  })
})