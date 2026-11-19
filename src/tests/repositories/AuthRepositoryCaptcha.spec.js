import { describe, test, expect, vi, afterEach } from 'vitest'
import AuthRepository from '../../repositories/AuthRepository'

function prepararFetch() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ id: 1, token: 't' }),
    text: async () => '',
  })
}

describe('AuthRepository con CAPTCHA', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('login envía el token del CAPTCHA si se le da', async () => {
    const fetchFalso = prepararFetch()

    await new AuthRepository().login('ana@test.com', '1234', 'token-captcha')

    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      email: 'ana@test.com',
      password: '1234',
      captchaToken: 'token-captcha',
    })
  })

  test('login sin token no envía el campo captchaToken', async () => {
    const fetchFalso = prepararFetch()

    await new AuthRepository().login('ana@test.com', '1234')

    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      email: 'ana@test.com',
      password: '1234',
    })
  })

  test('register envía el token del CAPTCHA dentro de los datos', async () => {
    const fetchFalso = prepararFetch()

    await new AuthRepository().register({ nombre: 'Ana', captchaToken: 'token-captcha' })

    expect(JSON.parse(fetchFalso.mock.calls[0][1].body).captchaToken).toBe('token-captcha')
  })
})
