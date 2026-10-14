import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import pinia from '../../pinia/pinia'
import { useAuthStore } from '../../stores/auth'
import router from '../../router/index'

describe('guard del router', () => {
  beforeEach(async () => {
    // Se empieza en una ruta pública distinta del inicio,
    // para notar cuándo el guard redirige al inicio
    await router.push('/buscar')
  })

  afterEach(() => {
    useAuthStore(pinia).logout()
  })

  test('un visitante que entra en una ruta privada va al login', async () => {
    await router.push('/solicitudes')

    expect(router.currentRoute.value.name).toBe('login')
  })

  test('las rutas públicas se pueden ver sin sesión', async () => {
    await router.push('/cuidador/1')

    expect(router.currentRoute.value.name).toBe('perfil-cuidador')
  })

  test('una familia puede entrar en sus solicitudes', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')

    await router.push('/solicitudes')

    expect(router.currentRoute.value.name).toBe('solicitudes')
  })

  test('un cuidador no puede entrar en las solicitudes de familia', async () => {
    useAuthStore(pinia).login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    await router.push('/solicitudes')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('una familia no puede entrar en las solicitudes de cuidador', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')

    await router.push('/solicitudes-cuidador')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('un cuidador puede entrar en editar su perfil', async () => {
    useAuthStore(pinia).login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    await router.push('/editar-perfil')

    expect(router.currentRoute.value.name).toBe('editar-perfil')
  })

  test('el historial lo pueden ver la familia y el cuidador', async () => {
    const authStore = useAuthStore(pinia)

    authStore.login(1, 'ana@test.com', '12345678', 'FAMILIA')
    await router.push('/historial')
    expect(router.currentRoute.value.name).toBe('historial')

    await router.push('/buscar')
    authStore.login(2, 'pepe@test.com', '12345678', 'CUIDADOR')
    await router.push('/historial')
    expect(router.currentRoute.value.name).toBe('historial')
  })
})