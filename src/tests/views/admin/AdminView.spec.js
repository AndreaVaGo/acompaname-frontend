import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminView from '../../../views/admin/AdminView.vue'
import AdminRepository from '../../../repositories/AdminRepository'
import { useAuthStore } from '../../../stores/auth'

const ESTADISTICAS = {
  totalFamilias: 18,
  totalCuidadores: 9,
  cuidadoresDisponibles: 4,
  solicitudesPendientes: 10,
  solicitudesAceptadas: 7,
  solicitudesRechazadas: 6,
  solicitudesCompletadas: 19,
  solicitudesHospital: 27,
  solicitudesDomicilio: 15,
  ingresosCobrados: 1260,
  ingresosPendientes: 340,
  valoracionMedia: 4.6,
  horasMediasHastaAceptar: 5.0,
}

const AVISOS = {
  pendientesProximas48Horas: 3,
  pendientesVencidas: 1,
  pagosSinCobrarMasDeUnaSemana: 2,
}

const CUIDADORES = [
  { id: 1, nombre: 'Marta Suárez', notaMedia: 4.9, serviciosCompletados: 12 },
]

const VALORACIONES = [
  {
    id: 1,
    puntuacion: 5,
    comentario: 'Muy atenta con mi madre.',
    fecha: '2026-11-10',
    nombreFamilia: 'Ana',
    nombreCuidador: 'Marta Suárez',
  },
]

const USUARIOS = [
  { id: 1, nombre: 'Ana', email: 'ana@test.com', telefono: '600', rol: 'FAMILIA', activo: true },
  { id: 2, nombre: 'Pepe', email: 'pepe@test.com', telefono: '611', rol: 'CUIDADOR', activo: true },
  { id: 3, nombre: 'Luis', email: 'luis@test.com', telefono: '622', rol: 'FAMILIA', activo: false },
  { id: 9, nombre: 'Admin', email: 'admin@test.com', telefono: '633', rol: 'ADMIN', activo: true },
]

const SOLICITUDES = [
  {
    id: 1,
    tipoCuidado: 'hospitalario',
    nombrePaciente: 'Rosa',
    fechaCuidado: '2026-10-22',
    estado: 'PENDIENTE',
    nombreFamilia: 'Ana',
    nombreCuidador: 'Pepe',
  },
]

// Hace que el repositorio devuelva datos de prueba (los cambios sustituyen a los de por defecto)
function prepararRepositorio(cambios) {
  const datos = {
    estadisticas: ESTADISTICAS,
    avisos: AVISOS,
    cuidadores: CUIDADORES,
    valoraciones: VALORACIONES,
    usuarios: USUARIOS,
    solicitudes: SOLICITUDES,
    ...cambios,
  }
  vi.spyOn(AdminRepository.prototype, 'getEstadisticas').mockResolvedValue(datos.estadisticas)
  vi.spyOn(AdminRepository.prototype, 'getAvisos').mockResolvedValue(datos.avisos)
  vi.spyOn(AdminRepository.prototype, 'getMejoresCuidadores').mockResolvedValue(datos.cuidadores)
  vi.spyOn(AdminRepository.prototype, 'getUltimasValoraciones').mockResolvedValue(datos.valoraciones)
  vi.spyOn(AdminRepository.prototype, 'getUsuarios').mockResolvedValue(datos.usuarios)
  vi.spyOn(AdminRepository.prototype, 'getSolicitudes').mockResolvedValue(datos.solicitudes)
  vi.spyOn(AdminRepository.prototype, 'cambiarActivo').mockResolvedValue({})
  vi.spyOn(AdminRepository.prototype, 'borrarValoracion').mockResolvedValue()
}

async function montarVista() {
  const wrapper = mount(AdminView)
  await flushPromises()
  return wrapper
}

function errorDelServidor(status) {
  const error = new Error('fallo')
  error.status = status
  return error
}

describe('AdminView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().login(9, 'admin@test.com', '12345678', 'ADMIN')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('mientras carga muestra Cargando el panel', () => {
    prepararRepositorio()
    AdminRepository.prototype.getEstadisticas.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(AdminView)

    expect(wrapper.text()).toContain('Cargando el panel...')
    expect(wrapper.text()).not.toContain('Requieren atención')
  })

  test('al terminar de cargar muestra todos los bloques del panel', async () => {
    prepararRepositorio()

    const wrapper = await montarVista()

    expect(wrapper.text()).not.toContain('Cargando el panel...')
    expect(wrapper.text()).toContain('Panel de administración')
    expect(wrapper.text()).toContain('Requieren atención')
    expect(wrapper.text()).toContain('Ingresos cobrados')
    expect(wrapper.text()).toContain('Solicitudes por estado')
    expect(wrapper.text()).toContain('Tipo de cuidado')
    expect(wrapper.text()).toContain('Pagos')
    expect(wrapper.text()).toContain('Cuidadores mejor valorados')
    expect(wrapper.text()).toContain('Últimas valoraciones')
    expect(wrapper.text()).toContain('Usuarios')
    expect(wrapper.text()).toContain('Marta Suárez')
    expect(wrapper.text()).toContain('pepe@test.com')
  })

  test('la solicitudes se piden sin filtro al empezar', async () => {
    prepararRepositorio()

    await montarVista()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenCalledWith('')
  })

  test('muestra el tiempo medio hasta aceptar con coma', async () => {
    prepararRepositorio({ estadisticas: { ...ESTADISTICAS, horasMediasHastaAceptar: 5.5 } })

    const wrapper = await montarVista()

    expect(wrapper.text()).toContain('Tiempo medio hasta aceptar una solicitud: 5,5 h.')
  })

  test('si ninguna solicitud se ha aceptado lo dice', async () => {
    prepararRepositorio({ estadisticas: { ...ESTADISTICAS, horasMediasHastaAceptar: null } })

    const wrapper = await montarVista()

    expect(wrapper.text()).toContain('Todavía no se ha aceptado ninguna solicitud.')
  })

  test('si falla la carga muestra el motivo y no el panel', async () => {
    prepararRepositorio()
    AdminRepository.prototype.getAvisos.mockRejectedValue(errorDelServidor(500))

    const wrapper = await montarVista()

    expect(wrapper.text()).toContain(
      'No se pudo cargar el panel. Ha ocurrido un error en el servidor. Inténtalo más tarde.'
    )
    expect(wrapper.text()).not.toContain('Cargando el panel...')
    expect(wrapper.text()).not.toContain('Cuidadores mejor valorados')
  })

  test('al cambiar el filtro vuelve a pedir las solicitudes de ese estado', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await wrapper.find('select').setValue('ACEPTADA')
    await flushPromises()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenLastCalledWith('ACEPTADA')
    expect(wrapper.find('select').element.value).toBe('ACEPTADA')
  })

  test('el botón de los avisos filtra las solicitudes pendientes', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    const boton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Ver solicitudes pendientes')
    await boton.trigger('click')
    await flushPromises()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenLastCalledWith('PENDIENTE')
    expect(wrapper.find('select').element.value).toBe('PENDIENTE')
  })

  test('si falla al filtrar muestra el motivo y mantiene la tabla', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    AdminRepository.prototype.getSolicitudes.mockRejectedValue(errorDelServidor(500))

    await wrapper.find('select').setValue('RECHAZADA')
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudieron cargar las solicitudes.')
    expect(wrapper.text()).toContain('Cuidadores mejor valorados')
  })

  test('bloquear a un usuario lo guarda, recarga la lista y lo confirma', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    // La segunda fila de la tabla de usuarios es Pepe (id 2), que está activo
    await wrapper.findAll('.admin-usuarios tbody tr')[1].find('button').trigger('click')
    await flushPromises()

    expect(AdminRepository.prototype.cambiarActivo).toHaveBeenCalledWith(2, false)
    expect(AdminRepository.prototype.getUsuarios).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Usuario bloqueado.')
  })

  test('desbloquear a un usuario bloqueado lo vuelve a activar', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    // La tercera fila es Luis (id 3), que está bloqueado
    await wrapper.findAll('.admin-usuarios tbody tr')[2].find('button').trigger('click')
    await flushPromises()

    expect(AdminRepository.prototype.cambiarActivo).toHaveBeenCalledWith(3, true)
    expect(wrapper.text()).toContain('Usuario desbloqueado.')
  })

  test('si falla al bloquear muestra el motivo', async () => {
    prepararRepositorio()
    AdminRepository.prototype.cambiarActivo.mockRejectedValue(errorDelServidor(403))
    const wrapper = await montarVista()

    await wrapper.findAll('.admin-usuarios tbody tr')[1].find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se pudo cambiar el estado del usuario. No tienes permiso para hacer esto.'
    )
    expect(wrapper.text()).not.toContain('Usuario bloqueado.')
  })

  test('el administrador no tiene botón para bloquearse a sí mismo', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    const filaAdmin = wrapper.findAll('.admin-usuarios tbody tr')[3]

    expect(filaAdmin.find('button').exists()).toBe(false)
  })

  test('eliminar una valoración la borra y recarga lista, cuidadores y estadísticas', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await wrapper.find('.admin-valoraciones__eliminar').trigger('click')
    await wrapper.find('.admin-valoraciones__si').trigger('click')
    await flushPromises()

    expect(AdminRepository.prototype.borrarValoracion).toHaveBeenCalledWith(1)
    expect(AdminRepository.prototype.getUltimasValoraciones).toHaveBeenCalledTimes(2)
    expect(AdminRepository.prototype.getMejoresCuidadores).toHaveBeenCalledTimes(2)
    expect(AdminRepository.prototype.getEstadisticas).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Valoración eliminada.')
  })

  test('si la valoración ya no existe muestra el motivo', async () => {
    prepararRepositorio()
    AdminRepository.prototype.borrarValoracion.mockRejectedValue(errorDelServidor(404))
    const wrapper = await montarVista()

    await wrapper.find('.admin-valoraciones__eliminar').trigger('click')
    await wrapper.find('.admin-valoraciones__si').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se pudo eliminar la valoración. No se ha encontrado lo que buscas.'
    )
    expect(wrapper.text()).not.toContain('Valoración eliminada.')
  })
})