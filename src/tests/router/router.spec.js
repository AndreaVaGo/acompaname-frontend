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

  test('un visitante que entra en los pagos va al login', async () => {
    await router.push('/pagos')

    expect(router.currentRoute.value.name).toBe('login')
  })

  test('una familia puede entrar en sus pagos', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')

    await router.push('/pagos')

    expect(router.currentRoute.value.name).toBe('pagos')
  })

  test('un cuidador no puede entrar en los pagos de la familia', async () => {
    useAuthStore(pinia).login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    await router.push('/pagos')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('el administrador no puede entrar en los pagos de la familia', async () => {
    useAuthStore(pinia).login(9, 'admin@test.com', '12345678', 'ADMIN')

    await router.push('/pagos')

    expect(router.currentRoute.value.name).toBe('landing')
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

  test('un visitante que entra en el panel de administración va al login', async () => {
    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('login')
  })

  test('el administrador puede entrar en el panel de administración', async () => {
    useAuthStore(pinia).login(9, 'admin@test.com', '12345678', 'ADMIN')

    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('admin')
  })

  test('una familia no puede entrar en el panel de administración', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')

    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('los términos y condiciones se pueden ver sin sesión', async () => {
    await router.push('/terminos')

    expect(router.currentRoute.value.name).toBe('terminos')
  })

  test('cada página pone su título en la pestaña del navegador', async () => {
    await router.push('/terminos')

    expect(document.title).toBe('Términos y condiciones · Acompáñame')
  })

  test('la portada solo lleva el nombre de la web como título', async () => {
    await router.push('/')

    expect(document.title).toBe('Acompáñame')
  })

  test('la página 404 tiene su propio título', async () => {
    await router.push('/esta-pagina-no-existe')

    expect(document.title).toBe('Página no encontrada · Acompáñame')
  })

  test('todas las rutas, menos la portada, tienen título', () => {
    const sinTitulo = router
      .getRoutes()
      .filter((ruta) => ruta.name !== 'landing' && !ruta.meta.titulo)
      .map((ruta) => ruta.name)

    expect(sinTitulo).toEqual([])
  })

  test('una dirección que no existe muestra la página 404', async () => {
    await router.push('/esta-pagina-no-existe')

    expect(router.currentRoute.value.name).toBe('no-encontrado')
  })

  test('una dirección con varios tramos que no existe también muestra la 404', async () => {
    await router.push('/cuidadores/uno/dos')

    expect(router.currentRoute.value.name).toBe('no-encontrado')
  })

  test('el administrador no puede entrar en las páginas de la familia', async () => {
    useAuthStore(pinia).login(9, 'admin@test.com', '12345678', 'ADMIN')

    await router.push('/solicitudes')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('un visitante que entra en las sugerencias va al login', async () => {
    await router.push('/sugerencias')

    expect(router.currentRoute.value.name).toBe('login')
  })

  test('una familia y un cuidador pueden entrar en las sugerencias', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')
    await router.push('/sugerencias')
    expect(router.currentRoute.value.name).toBe('sugerencias')

    await router.push('/buscar')
    useAuthStore(pinia).login(2, 'pepe@test.com', '12345678', 'CUIDADOR')
    await router.push('/sugerencias')
    expect(router.currentRoute.value.name).toBe('sugerencias')
  })

  test('el administrador no puede entrar en las sugerencias', async () => {
    useAuthStore(pinia).login(9, 'admin@test.com', '12345678', 'ADMIN')

    await router.push('/sugerencias')

    expect(router.currentRoute.value.name).toBe('landing')
  })

  test('un visitante que entra en Mi calendario va al login', async () => {
    await router.push('/mi-calendario')

    expect(router.currentRoute.value.name).toBe('login')
  })

  test('un cuidador puede entrar en Mi calendario', async () => {
    useAuthStore(pinia).login(2, 'pepe@test.com', '12345678', 'CUIDADOR')

    await router.push('/mi-calendario')

    expect(router.currentRoute.value.name).toBe('mi-calendario')
  })

  test('una familia no puede entrar en Mi calendario', async () => {
    useAuthStore(pinia).login(1, 'ana@test.com', '12345678', 'FAMILIA')

    await router.push('/mi-calendario')

    expect(router.currentRoute.value.name).toBe('landing')
  })
})
