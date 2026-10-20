import { describe, test, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import LoginView from '../../../views/auth/LoginView.vue'
import AuthRepository from '../../../repositories/AuthRepository'
import { useAuthStore } from '../../../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

function montarVista() {
  const pinia = createPinia()
  const wrapper = mount(LoginView, {
    global: {
      plugins: [router, pinia],
    },
  })
  return { wrapper, pinia }
}

async function rellenarYEnviar(wrapper, email, password) {
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('form').trigger('submit')
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('LoginView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  test('muestra error si los campos están vacíos', async () => {
    const { wrapper } = montarVista()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Por favor, rellena todos los campos.')
  })

  test('con datos correctos inicia sesión y va al inicio', async () => {
    vi.spyOn(AuthRepository.prototype, 'login').mockResolvedValue({
      id: 1,
      username: 'ana@test.com',
      roles: 'FAMILIA',
    })
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const { wrapper, pinia } = montarVista()

    await rellenarYEnviar(wrapper, 'ana@test.com', '12345678')

    expect(AuthRepository.prototype.login).toHaveBeenCalledWith(
      'ana@test.com',
      '12345678'
    )
    expect(useAuthStore(pinia).estaAutenticado).toBe(true)
    expect(push).toHaveBeenCalledWith('/')
  })

  test('si el login falla, muestra el error y no cambia de página', async () => {
    const errorCredenciales = new Error('fallo')
    errorCredenciales.status = 401
    vi.spyOn(AuthRepository.prototype, 'login').mockRejectedValue(
      errorCredenciales
    )
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const { wrapper, pinia } = montarVista()

    await rellenarYEnviar(wrapper, 'ana@test.com', 'mal')

    expect(wrapper.text()).toContain('Email o contraseña incorrectos.')
    expect(useAuthStore(pinia).estaAutenticado).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })

  test('si el servidor falla, lo dice y no habla de contraseña incorrecta', async () => {
    const errorServidor = new Error('fallo')
    errorServidor.status = 500
    vi.spyOn(AuthRepository.prototype, 'login').mockRejectedValue(errorServidor)
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const { wrapper } = montarVista()

    await rellenarYEnviar(wrapper, 'ana@test.com', '12345678')

    expect(wrapper.text()).toContain(
      'No se pudo iniciar sesión. Ha ocurrido un error en el servidor. Inténtalo más tarde.'
    )
    expect(wrapper.text()).not.toContain('Email o contraseña incorrectos.')
    expect(push).not.toHaveBeenCalled()
  })

  test('si no hay conexión con el servidor, lo dice', async () => {
    vi.spyOn(AuthRepository.prototype, 'login').mockRejectedValue(
      new TypeError('Failed to fetch')
    )
    const { wrapper } = montarVista()

    await rellenarYEnviar(wrapper, 'ana@test.com', '12345678')

    expect(wrapper.text()).toContain(
      'No se pudo iniciar sesión. No se pudo conectar con el servidor.'
    )
    expect(wrapper.text()).not.toContain('Email o contraseña incorrectos.')
  })

  test('si falla sin código de error, muestra solo que no se pudo iniciar sesión', async () => {
    vi.spyOn(AuthRepository.prototype, 'login').mockRejectedValue(
      new Error('fallo')
    )
    const { wrapper } = montarVista()

    await rellenarYEnviar(wrapper, 'ana@test.com', '12345678')

    expect(wrapper.text()).toContain('No se pudo iniciar sesión.')
    expect(wrapper.text()).not.toContain('Email o contraseña incorrectos.')
  })
})