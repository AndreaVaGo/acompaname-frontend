import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CaptchaTurnstile from '../../components/CaptchaTurnstile.vue'

// Un "turnstile" falso: guarda las opciones con las que se dibuja para poder llamar a sus funciones
let opciones
let turnstileFalso

beforeEach(() => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')
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
  vi.unstubAllEnvs()
  delete window.turnstile
  document.head.querySelectorAll('script[src*="turnstile"]').forEach((s) => s.remove())
})

describe('CaptchaTurnstile', () => {
  test('dibuja el widget con la clave pública y en español', async () => {
    mount(CaptchaTurnstile)
    await flushPromises()

    expect(turnstileFalso.render).toHaveBeenCalledTimes(1)
    expect(opciones.sitekey).toBe('clave-publica')
    expect(opciones.language).toBe('es')
  })

  test('al resolver el CAPTCHA guarda el token', async () => {
    const wrapper = mount(CaptchaTurnstile)
    await flushPromises()

    opciones.callback('token-bueno')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['token-bueno'])
  })

  test('si el token caduca o hay un error, el token se vacía', async () => {
    const wrapper = mount(CaptchaTurnstile)
    await flushPromises()

    opciones['expired-callback']()
    opciones['error-callback']()

    expect(wrapper.emitted('update:modelValue')).toEqual([[''], ['']])
  })

  test('reiniciar vacía el token y pide uno nuevo a Cloudflare', async () => {
    const wrapper = mount(CaptchaTurnstile)
    await flushPromises()

    wrapper.vm.reiniciar()

    expect(turnstileFalso.reset).toHaveBeenCalledWith('widget-1')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([''])
  })

  test('al salir de la pantalla quita el widget', async () => {
    const wrapper = mount(CaptchaTurnstile)
    await flushPromises()

    wrapper.unmount()

    expect(turnstileFalso.remove).toHaveBeenCalledWith('widget-1')
  })

  test('si no se puede cargar el script, avisa con un mensaje', async () => {
    delete window.turnstile
    const wrapper = mount(CaptchaTurnstile)

    document.head.querySelector('script[src*="turnstile"]').onerror()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('No se pudo cargar el CAPTCHA')
  })

  test('si se sale de la pantalla antes de que cargue, no se dibuja nada', async () => {
    delete window.turnstile
    const wrapper = mount(CaptchaTurnstile)

    wrapper.unmount()
    window.turnstile = turnstileFalso
    document.head.querySelector('script[src*="turnstile"]').onload()
    await flushPromises()

    expect(turnstileFalso.render).not.toHaveBeenCalled()
  })
})
