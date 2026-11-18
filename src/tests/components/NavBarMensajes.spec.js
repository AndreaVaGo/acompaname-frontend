import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import UsuarioRepository from '../../repositories/UsuarioRepository'
import CuidadorRepository from '../../repositories/CuidadorRepository'
import SolicitudRepository from '../../repositories/SolicitudRepository'
import PagoRepository from '../../repositories/PagoRepository'
import MensajeRepository from '../../repositories/MensajeRepository'
import NavBar from '../../components/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function montarBarra(rol, solicitudes = []) {
  vi.spyOn(UsuarioRepository.prototype, 'getById').mockResolvedValue({ nombre: 'Ana' })
  vi.spyOn(CuidadorRepository.prototype, 'getMiPerfil').mockResolvedValue({ id: 3 })
  vi.spyOn(SolicitudRepository.prototype, 'getMisSolicitudes').mockResolvedValue(solicitudes)
  vi.spyOn(PagoRepository.prototype, 'getMisPagos').mockResolvedValue([])
  useAuthStore().login(1, 'ana@test.com', '12345678', rol)
  const wrapper = mount(NavBar, { global: { plugins: [router] } })
  await esperar()
  return wrapper
}

describe('NavBar · mensajes sin leer', () => {
  beforeEach(async () => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    await router.push('/')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  test('la familia ve en Solicitudes el número de mensajes sin leer', async () => {
    vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 3, porSolicitud: {} })

    const wrapper = await montarBarra('FAMILIA')

    expect(wrapper.find('.navbar__aviso').text()).toBe('3')
  })

  test('la persona cuidadora también ve el número de mensajes sin leer', async () => {
    vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 2, porSolicitud: {} })

    const wrapper = await montarBarra('CUIDADOR')

    expect(wrapper.find('.navbar__aviso').text()).toBe('2')
  })

  test('los mensajes sin leer se suman a las solicitudes pendientes', async () => {
    vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 2, porSolicitud: {} })

    // La persona cuidadora tiene 1 solicitud pendiente de responder y 2 mensajes sin leer
    const wrapper = await montarBarra('CUIDADOR', [{ id: 1, estado: 'PENDIENTE' }])

    expect(wrapper.find('.navbar__aviso').text()).toBe('3')
  })

  test('sin mensajes sin leer no sale ningún número', async () => {
    vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 0, porSolicitud: {} })

    const wrapper = await montarBarra('FAMILIA')

    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
  })

  test('si falla la consulta de mensajes la barra funciona y no sale número', async () => {
    vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockRejectedValue(new Error('sin red'))

    const wrapper = await montarBarra('FAMILIA')

    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
    expect(wrapper.text()).toContain('Solicitudes')
  })

  test('el administrador no consulta los mensajes', async () => {
    const espia = vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 5, porSolicitud: {} })

    const wrapper = await montarBarra('ADMIN')

    expect(espia).not.toHaveBeenCalled()
    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)
  })

  test('sin sesión iniciada no consulta los mensajes', async () => {
    const espia = vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 5, porSolicitud: {} })

    mount(NavBar, { global: { plugins: [router] } })
    await esperar()

    expect(espia).not.toHaveBeenCalled()
  })

  test('cada 30 segundos vuelve a preguntar y actualiza el número', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const espia = vi
      .spyOn(MensajeRepository.prototype, 'getNoLeidos')
      .mockResolvedValueOnce({ total: 0, porSolicitud: {} })
      .mockResolvedValueOnce({ total: 4, porSolicitud: {} })

    const wrapper = await montarBarra('FAMILIA')
    expect(wrapper.find('.navbar__aviso').exists()).toBe(false)

    vi.advanceTimersByTime(30000)
    await esperar()

    expect(espia).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.navbar__aviso').text()).toBe('4')
  })

  test('al quitar la barra deja de preguntar', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const espia = vi.spyOn(MensajeRepository.prototype, 'getNoLeidos').mockResolvedValue({ total: 0, porSolicitud: {} })

    const wrapper = await montarBarra('FAMILIA')
    wrapper.unmount()
    vi.advanceTimersByTime(90000)
    await esperar()

    expect(espia).toHaveBeenCalledTimes(1)
  })
})
