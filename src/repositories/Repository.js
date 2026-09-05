export default class Repository {
  constructor(uri) {
    this.uri = uri
  }

  getHeaders() {
    const credenciales = sessionStorage.getItem('credenciales')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (credenciales) {
      headers['Authorization'] = `Basic ${credenciales}`
    }
    return headers
  }

  async get(path = '') {
    const response = await fetch(`${this.uri}${path}`, {
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error('Error en la petición GET')
    return await response.json()
  }

  async post(path, data) {
    const response = await fetch(`${this.uri}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error en la petición POST')
    return await response.json()
  }

  async put(path, data) {
    const response = await fetch(`${this.uri}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error en la petición PUT')
    return await response.json()
  }

  async delete(path) {
    const response = await fetch(`${this.uri}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error('Error en la petición DELETE')
  }
}