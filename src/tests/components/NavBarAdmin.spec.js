import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import UsuarioRepository from '../../repositories/UsuarioRepository'
import SolicitudRepository from '../../repositories/SolicitudRepository'
import PagoRepository from '../../repositories/PagoRepository'
import NavBar from '../../components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

// Monta la barra con el administrador que ha iniciado sesión
async function montarNavBarComoAdmin() {
  vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
    nombre: 'Admin',
  })
  const authStore = useAuthStore()
  authStore.login(9, 'admin@test.com', '12345678', 'ADMIN')
  const wrapper = mount(NavBar, {
    global: {
      plugins: [router],
    },
  })
  await esperar()
  return wrapper
}

describe('NavBar del administrador', () => {
  beforeEach(async () => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    await router.push('/')
    vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockResolvedValue(
      []
    )
    vi.spyOn(PagoRepository.prototype, 'getMisPagos').mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('el administrador ve el enlace Panel que lleva a /admin', async () => {
    const wrapper = await montarNavBarComoAdmin()

    expect(wrapper.text()).toContain('Panel')
    expect(wrapper.html()).toContain('href="/admin"')
  })

  test('el administrador no ve Buscar, Solicitudes ni Historial', async () => {
    const wrapper = await montarNavBarComoAdmin()

    expect(wrapper.text()).not.toContain('Buscar')
    expect(wrapper.text()).not.toContain('Solicitudes')
    expect(wrapper.text()).not.toContain('Historial')
  })

  test('el menú dice que es una cuenta de administración', async () => {
    const wrapper = await montarNavBarComoAdmin()
    await wrapper.find('.navbar__avatar').trigger('click')

    expect(wrapper.find('.navbar__menu-header').text()).toContain('Admin')
    expect(wrapper.find('.navbar__menu-role').text()).toBe(
      'Cuenta de administración'
    )
  })

  test('el menú del administrador solo tiene Cambiar contraseña y Cerrar sesión', async () => {
    const wrapper = await montarNavBarComoAdmin()
    await wrapper.find('.navbar__avatar').trigger('click')

    const opciones = wrapper
      .findAll('.navbar__menu-item')
      .map((boton) => boton.text())

    expect(opciones).toEqual(['Cambiar contraseña', 'Cerrar sesión'])
  })

  test('el administrador no carga solicitudes ni pagos y no ve avisos', async () => {
    const wrapper = await montarNavBarComoAdmin()

    expect(SolicitudRepository.prototype.getMisSolicitudes).not.toHaveBeenCalled()
    expect(PagoRepository.prototype.getMisPagos).not.toHaveBeenCalled()
    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
  })

  test('una familia no ve el enlace Panel', async () => {
    vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({
      nombre: 'Ana',
    })
    const authStore = useAuthStore()
    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')
    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    })
    await esperar()

    expect(wrapper.text()).not.toContain('Panel')
  })
})