import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../../../views/auth/RegisterView.vue'
import AuthRepository from '../../../repositories/AuthRepository'
import RoleRepository from '../../../repositories/RoleRepository'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

const PASSWORD_VALIDA = 'Segura123!'

let opciones
let turnstileFalso

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function montarVista() {
  vi.spyOn(RoleRepository.prototype, 'getAll').mockResolvedValue([
    { id: 4, name: 'FAMILIA' },
    { id: 5, name: 'CUIDADOR' },
  ])
  const wrapper = mount(RegisterView, { global: { plugins: [router] } })
  await esperar()
  return wrapper
}

async function rellenarYEnviar(wrapper) {
  await wrapper.find('#nombre').setValue('Ana López')
  await wrapper.find('#email').setValue('ana@test.com')
  await wrapper.find('#password').setValue(PASSWORD_VALIDA)
  await wrapper.find('#password-repetida').setValue(PASSWORD_VALIDA)
  await wrapper.find('#telefono').setValue('600111222')
  await wrapper.findAll('.register__role')[0].trigger('click')
  await wrapper.find('form').trigger('submit')
  await esperar()
}

describe('RegisterView con CAPTCHA', () => {
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
  })

  test('sin clave de Turnstile no se muestra el CAPTCHA ni se envía token', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
    const registrar = vi.spyOn(AuthRepository.prototype, 'register').mockResolvedValue({})
    vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarYEnviar(wrapper)

    expect(wrapper.find('[data-testid="captcha"]').exists()).toBe(false)
    expect(registrar.mock.calls[0][0]).not.toHaveProperty('captchaToken')
  })

  test('con clave de Turnstile se muestra el CAPTCHA', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')

    const wrapper = await montarVista()

    expect(wrapper.find('[data-testid="captcha"]').exists()).toBe(true)
  })

  test('sin resolver el CAPTCHA no se envía el registro y se avisa', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    const registrar = vi.spyOn(AuthRepository.prototype, 'register').mockResolvedValue({})
    const wrapper = await montarVista()

    await rellenarYEnviar(wrapper)

    expect(registrar).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Completa el CAPTCHA para continuar.')
  })

  test('con el CAPTCHA resuelto se envía el token con los datos del registro', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    const registrar = vi.spyOn(AuthRepository.prototype, 'register').mockResolvedValue({})
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    opciones.callback('token-captcha')
    await rellenarYEnviar(wrapper)

    expect(registrar.mock.calls[0][0].captchaToken).toBe('token-captcha')
    expect(registrar.mock.calls[0][0].rolesIds).toEqual([4])
    expect(push).toHaveBeenCalledWith('/login')
  })

  test('si el registro falla se pide un CAPTCHA nuevo', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
    vi.spyOn(AuthRepository.prototype, 'register').mockRejectedValue(new Error('mal'))
    const wrapper = await montarVista()

    opciones.callback('token-captcha')
    await rellenarYEnviar(wrapper)

    expect(turnstileFalso.reset).toHaveBeenCalledWith('widget-1')
  })
})
