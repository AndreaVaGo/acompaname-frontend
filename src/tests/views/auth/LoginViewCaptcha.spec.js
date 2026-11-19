import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import LoginView from '../../../views/auth/LoginView.vue'
import AuthRepository from '../../../repositories/AuthRepository'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

let opciones
let turnstileFalso

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function montarVista() {
  const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } })
  await esperar()
  return wrapper
}

async function enviar(wrapper) {
  await wrapper.find('#email').setValue('ana@test.com')
  await wrapper.find('#password').setValue('12345678')
  await wrapper.find('form').trigger('submit')
  await esperar()
}

describe('LoginView con CAPTCHA', () => {
  beforeEach(() => {
    turnstileFalso = {
      render: vi.fn((elemento, opts) => {
        opciones = opts
        return 'widget-1'
      }),
      reset: vi.fn(),
      remove: vi.fn(),
    }
    window.turnstile = turnstileFalso
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    delete window.turnstile
    sessionStorage.clear()
  })

  test('sin clave de Turnstile no se muestra el CAPTCHA', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')

    const wrapper = await montarVista()

    expect(wrapper.find('[data-testid="captcha"]').exists()).toBe(false)
    expect(turnstileFalso.render).not.toHaveBeenCalled()
  })

  test('con clave de Turnstile se muestra el CAPTCHA', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')

    const wrapper = await montarVista()

    expect(wrapper.find('[data-testid="captcha"]').exists()).toBe(true)
    expect(turnstileFalso.render).toHaveBeenCalledTimes(1)
  })

  test('sin resolver el CAPTCHA no se envía el login y se avisa', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    const login = vi.spyOn(AuthRepository.prototype, 'login').mockResolvedValue({})
    const wrapper = await montarVista()

    await enviar(wrapper)

    expect(login).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Completa el CAPTCHA para continuar.')
  })

  test('con el CAPTCHA resuelto se envía el token junto al email y la contraseña', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    const login = vi.spyOn(AuthRepository.prototype, 'login').mockResolvedValue({
      id: 1,
      username: 'ana@test.com',
      roles: 'FAMILIA',
      token: 't',
    })
    vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    opciones.callback('token-captcha')
    await enviar(wrapper)

    expect(login).toHaveBeenCalledWith('ana@test.com', '12345678', 'token-captcha')
  })

  test('si el login falla se pide un CAPTCHA nuevo (el token solo vale una vez)', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    const error = new Error('mal')
    error.status = 401
    vi.spyOn(AuthRepository.prototype, 'login').mockRejectedValue(error)
    const wrapper = await montarVista()

    opciones.callback('token-captcha')
    await enviar(wrapper)

    expect(turnstileFalso.reset).toHaveBeenCalledWith('widget-1')
    expect(wrapper.text()).toContain('Email o contraseña incorrectos')
  })
})
