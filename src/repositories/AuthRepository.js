import Repository from './Repository'

export default class AuthRepository extends Repository {
  constructor() {
    super('http://localhost:8080/api/v1')
  }

  async login(email, password) {
    const credenciales = btoa(`${email}:${password}`)
    const response = await fetch(`${this.uri}/login`, {
      headers: {
        Authorization: `Basic ${credenciales}`,
      },
    })
    if (!response.ok) throw new Error('Credenciales incorrectas')
    const data = await response.json()
    return { ...data, credenciales }
  }

  async register(usuarioData) {
    return this.post('/usuarios', usuarioData)
  }
}