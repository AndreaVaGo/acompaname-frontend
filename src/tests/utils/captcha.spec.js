import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

function scriptsDeTurnstile() {
  return document.head.querySelectorAll('script[src*="turnstile"]')
}

// El módulo guarda en memoria si ya descargó el script: se carga de nuevo en cada test
// para que un test no afecte a otro
async function cargarModulo() {
  return await import('../../utils/captcha')
}

describe('captcha', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    delete window.turnstile
    scriptsDeTurnstile().forEach((s) => s.remove())
  })

  test('sin clave el CAPTCHA está desactivado', async () => {
    const { claveTurnstile, captchaActivo } = await cargarModulo()
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')

    expect(claveTurnstile()).toBe('')
    expect(captchaActivo()).toBe(false)
  })

  test('con clave el CAPTCHA está activado', async () => {
    const { claveTurnstile, captchaActivo } = await cargarModulo()
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'clave-publica')

    expect(claveTurnstile()).toBe('clave-publica')
    expect(captchaActivo()).toBe(true)
  })

  test('si el script ya está cargado no se descarga otra vez', async () => {
    const { cargarTurnstile } = await cargarModulo()
    window.turnstile = { render: vi.fn() }

    const turnstile = await cargarTurnstile()

    expect(turnstile).toBe(window.turnstile)
    expect(scriptsDeTurnstile().length).toBe(0)
  })

  test('descarga el script de Cloudflare una sola vez aunque se pida dos veces', async () => {
    const { cargarTurnstile } = await cargarModulo()
    const primera = cargarTurnstile()
    const segunda = cargarTurnstile()

    expect(scriptsDeTurnstile().length).toBe(1)
    expect(scriptsDeTurnstile()[0].src).toContain('challenges.cloudflare.com/turnstile/v0/api.js')
    expect(scriptsDeTurnstile()[0].src).toContain('render=explicit')

    window.turnstile = { render: vi.fn() }
    scriptsDeTurnstile()[0].onload()

    expect(await primera).toBe(window.turnstile)
    expect(await segunda).toBe(window.turnstile)
  })

  test('si el script no se puede descargar falla y se puede volver a intentar', async () => {
    const { cargarTurnstile } = await cargarModulo()
    const intento = cargarTurnstile()
    scriptsDeTurnstile()[0].onerror()

    await expect(intento).rejects.toThrow('No se pudo cargar el CAPTCHA')

    // Un segundo intento vuelve a crear el script
    cargarTurnstile().catch(() => {})
    expect(scriptsDeTurnstile().length).toBe(2)
    scriptsDeTurnstile()[1].onerror()
  })
})
