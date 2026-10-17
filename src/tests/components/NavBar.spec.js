import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import UsuarioRepository from '../../repositories/UsuarioRepository'
import CuidadorRepository from '../../repositories/CuidadorRepository'
import SolicitudRepository from '../../repositories/SolicitudRepository'
import PagoRepository from '../../repositories/PagoRepository'
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

// Monta la barra con un cuidador que ha iniciado sesión
async function montarNavBarComoCuidador() {
  vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
    nombre: 'Pepe',
  })
  vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
    id: 3,
  })
  const authStore = useAuthStore()
  authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')
  return montarNavBar()
}

// Monta la barra con una familia que ha iniciado sesión
async function montarNavBarComoFamilia() {
  vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
    nombre: 'Ana',
  })
  const authStore = useAuthStore()
  authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')
  return montarNavBar()
}

describe('NavBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Por defecto no hay solicitudes ni pagos, así que no hay avisos
    vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockResolvedValue(
      []
    )
    vi.spyOn(PagoRepository.prototype, 'getMisPagos').mockResolvedValue([])
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

  test('el menú del cuidador tiene la opción Cambiar contraseña', async () => {
    const wrapper = await montarNavBarComoCuidador()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('#cambiar-password').text()).toBe('Cambiar contraseña')
  })

  test('Cambiar contraseña lleva a su página y cierra el menú', async () => {
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarNavBarComoCuidador()
    await wrapper.find('.navbar__avatar').trigger('click')
    await wrapper.find('#cambiar-password').trigger('click')

    expect(push).toHaveBeenCalledWith('/cambiar-password')
    expect(wrapper.find('.navbar__menu').exists()).toBe(false)
  })

  test('el menú del cuidador tiene la opción Editar mis datos', async () => {
    const wrapper = await montarNavBarComoCuidador()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('#editar-datos').text()).toBe('Editar mis datos')
  })

  test('Editar mis datos lleva a su página y cierra el menú', async () => {
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarNavBarComoCuidador()
    await wrapper.find('.navbar__avatar').trigger('click')
    await wrapper.find('#editar-datos').trigger('click')

    expect(push).toHaveBeenCalledWith('/editar-datos')
    expect(wrapper.find('.navbar__menu').exists()).toBe(false)
  })

  test('el menú de la familia tiene la opción Editar mis datos', async () => {
    const wrapper = await montarNavBarComoFamilia()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('#editar-datos').text()).toBe('Editar mis datos')
  })

  test('el menú de la familia tiene la opción Cambiar contraseña', async () => {
    const wrapper = await montarNavBarComoFamilia()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('#cambiar-password').text()).toBe('Cambiar contraseña')
  })

  test('la familia: Editar mis datos lleva a su página y cierra el menú', async () => {
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarNavBarComoFamilia()
    await wrapper.find('.navbar__avatar').trigger('click')
    await wrapper.find('#editar-datos').trigger('click')

    expect(push).toHaveBeenCalledWith('/editar-datos')
    expect(wrapper.find('.navbar__menu').exists()).toBe(false)
  })

  test('la familia: Cambiar contraseña lleva a su página y cierra el menú', async () => {
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarNavBarComoFamilia()
    await wrapper.find('.navbar__avatar').trigger('click')
    await wrapper.find('#cambiar-password').trigger('click')

    expect(push).toHaveBeenCalledWith('/cambiar-password')
    expect(wrapper.find('.navbar__menu').exists()).toBe(false)
  })

  test('el cuidador ve cuántas solicitudes pendientes tiene', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Pepe',
    })
    vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({
      id: 3,
    })
    vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockResolvedValue(
      [
        { id: 1, estado: 'PENDIENTE' },
        { id: 2, estado: 'PENDIENTE' },
        { id: 3, estado: 'ACEPTADA' },
      ]
    )
    const authStore = useAuthStore()
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__aviso').text()).toBe('2')
  })

  test('la familia ve cuántas solicitudes aceptadas le faltan por pagar', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockResolvedValue(
      [
        { id: 1, estado: 'ACEPTADA' },
        { id: 2, estado: 'ACEPTADA' },
        { id: 3, estado: 'PENDIENTE' },
      ]
    )
    vi.spyOn(PagoRepository.prototype, 'getMisPagos').mockResolvedValue([
      { solicitudId: 1, estado: 'COMPLETADO' },
    ])
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__aviso').text()).toBe('1')
  })

  test('no muestra aviso cuando no hay nada que atender', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
  })

  test('no muestra aviso si falla la carga de solicitudes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockRejectedValue(
      new Error('fallo')
    )
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')

    const wrapper = await montarNavBar()

    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
  })
})