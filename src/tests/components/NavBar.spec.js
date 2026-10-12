import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import UsuarioRepository from '../../repositories/UsuarioRepository'
import CuidadorRepository from '../../repositories/CuidadorRepository'
import NavBar from '../../components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

async function montarNavBar() {
  const wrapper = mount(NavBar, {
    global: {
      plugins: [router],
    },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return wrapper
}

describe('NavBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra el enlace Buscar cuando el rol es familia', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()

    expect(wrapper.text()).toContain('Buscar')
  })

  test('muestra el nombre en el menú en vez del correo', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('.navbar__menu-header').text()).toContain('Ana')
    expect(wrapper.find('.navbar__menu-header').text()).not.toContain(
      'ana@test.com'
    )
  })

  test('el cuidador ve su foto en el círculo del menú', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Pepe',
    })
    vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
      id: 3,
      foto: 'data:image/jpeg;base64,AAAA',
    })
    const authStore = useAuthStore()
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__avatar img').attributes('src')).toBe(
      'data:image/jpeg;base64,AAAA'
    )
  })

  test('el cuidador sin foto ve el monigote', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Pepe',
    })
    vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
      id: 3,
    })
    const authStore = useAuthStore()
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__avatar img').exists()).toBe(false)
    expect(wrapper.find('.foto-cuidador--sin-foto').exists()).toBe(true)
  })
})import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import UsuarioRepository from '../../repositories/UsuarioRepository'
import CuidadorRepository from '../../repositories/CuidadorRepository'
import NavBar from '../../components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

async function montarNavBar() {
  const wrapper = mount(NavBar, {
    global: {
      plugins: [router],
    },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return wrapper
}

describe('NavBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra el enlace Buscar cuando el rol es familia', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()

    expect(wrapper.text()).toContain('Buscar')
  })

  test('muestra el nombre en el menú en vez del correo', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('.navbar__menu-header').text()).toContain('Ana')
    expect(wrapper.find('.navbar__menu-header').text()).not.toContain(
      'ana@test.com'
    )
  })

  test('el cuidador ve su foto en el círculo del menú', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Pepe',
    })
    vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
      id: 3,
      foto: 'data:image/jpeg;base64,AAAA',
    })
    const authStore = useAuthStore()
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__avatar img').attributes('src')).toBe(
      'data:image/jpeg;base64,AAAA'
    )
  })

  test('el cuidador sin foto ve el monigote', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Pepe',
    })
    vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
      id: 3,
    })
    const authStore = useAuthStore()
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__avatar img').exists()).toBe(false)
    expect(wrapper.find('.foto-cuidador--sin-foto').exists()).toBe(true)
  })

  test('el menú tiene la opción Cambiar contraseña', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('#cambiar-password').text()).toBe('Cambiar contraseña')
  })

  test('Cambiar contraseña lleva a su página y cierra el menú', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()
    await wrapper.find('.navbar__avatar').trigger('click')
    await wrapper.find('#cambiar-password').trigger('click')

    expect(push).toHaveBeenCalledWith('/cambiar-password')
    expect(wrapper.find('.navbar__menu').exists()).toBe(false)
  })
})