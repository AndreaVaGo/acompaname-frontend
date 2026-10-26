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

const PAGOS_RESUMEN = {
  totalCobrado: 54,
  totalPendiente: 36,
  numeroCobrados: 2,
  numeroPendientes: 1,
  numeroCancelados: 0,
  importeMedio: 30,
  porcentajeCobrado: 66.7,
  pendientesMasDeSieteDias: 1,
  importePendienteMasDeSieteDias: 36,
  porTipoCuidado: [
    { tipoCuidado: 'hospitalario', pagos: 2, importe: 54 },
    { tipoCuidado: 'domicilio', pagos: 1, importe: 36 },
  ],
  porMes: [
    { mes: '2026-05', cobrado: 0, pendiente: 0 },
    { mes: '2026-06', cobrado: 0, pendiente: 0 },
    { mes: '2026-07', cobrado: 0, pendiente: 0 },
    { mes: '2026-08', cobrado: 0, pendiente: 0 },
    { mes: '2026-09', cobrado: 0, pendiente: 0 },
    { mes: '2026-10', cobrado: 54, pendiente: 36 },
  ],
  topCuidadores: [{ cuidadorId: 1, nombre: 'Pepe Cobrador', pagos: 2, importeCobrado: 54 }],
}

const PAGOS = [
  {
    id: 1,
    solicitudId: 5,
    nombreFamilia: 'Ana',
    nombreCuidador: 'Pepe',
    tipoCuidado: 'hospitalario',
    importe: 36,
    estado: 'PENDIENTE',
    fecha: '2026-10-10',
    diasDesdeCreacion: 10,
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
    pagosResumen: PAGOS_RESUMEN,
    pagos: PAGOS,
    ...cambios,
  }
  vi.spyOn(AdminRepository.prototype, 'getEstadisticas').mockResolvedValue(datos.estadisticas)
  vi.spyOn(AdminRepository.prototype, 'getAvisos').mockResolvedValue(datos.avisos)
  vi.spyOn(AdminRepository.prototype, 'getMejoresCuidadores').mockResolvedValue(datos.cuidadores)
  vi.spyOn(AdminRepository.prototype, 'getUltimasValoraciones').mockResolvedValue(datos.valoraciones)
  vi.spyOn(AdminRepository.prototype, 'getUsuarios').mockResolvedValue(datos.usuarios)
  vi.spyOn(AdminRepository.prototype, 'getSolicitudes').mockResolvedValue(datos.solicitudes)
  vi.spyOn(AdminRepository.prototype, 'getPagosResumen').mockResolvedValue(datos.pagosResumen)
  vi.spyOn(AdminRepository.prototype, 'getPagos').mockResolvedValue(datos.pagos)
  vi.spyOn(AdminRepository.prototype, 'cambiarActivo').mockResolvedValue({})
  vi.spyOn(AdminRepository.prototype, 'borrarValoracion').mockResolvedValue()
}

async function montarVista() {
  const wrapper = mount(AdminView)
  await flushPromises()
  return wrapper
}

// Pulsa un botón del menú lateral por su texto (Resumen, Solicitudes, Pagos, Usuarios)
async function irASeccion(wrapper, texto) {
  const boton = wrapper.findAll('.admin-menu__boton').find((b) => b.text() === texto)
  await boton.trigger('click')
  await flushPromises()
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
    expect(wrapper.find('.admin-menu').exists()).toBe(false)
  })

  test('al terminar de cargar muestra el menú y la sección Resumen', async () => {
    prepararRepositorio()

    const wrapper = await montarVista()

    expect(wrapper.text()).not.toContain('Cargando el panel...')
    expect(wrapper.text()).toContain('Panel de administración')
    const textosMenu = wrapper.findAll('.admin-menu__boton').map((b) => b.text())
    expect(textosMenu).toEqual(['Resumen', 'Solicitudes', 'Pagos', 'Usuarios'])
    expect(wrapper.find('.admin-menu__boton--activo').text()).toBe('Resumen')
    expect(wrapper.text()).toContain('Requieren atención')
    expect(wrapper.text()).toContain('Ingresos cobrados')
    expect(wrapper.text()).toContain('Solicitudes por estado')
    expect(wrapper.text()).toContain('Tipo de cuidado')
    expect(wrapper.text()).toContain('Cuidadores mejor valorados')
    expect(wrapper.text()).toContain('Últimas valoraciones')
    expect(wrapper.text()).toContain('Marta Suárez')
  })

  test('en Resumen no se ven las tablas de usuarios, solicitudes ni pagos', async () => {
    prepararRepositorio()

    const wrapper = await montarVista()

    expect(wrapper.find('.admin-usuarios').exists()).toBe(false)
    expect(wrapper.find('.admin-solicitudes').exists()).toBe(false)
    expect(wrapper.find('.admin-pagos-tabla').exists()).toBe(false)
  })

  test('la sección Usuarios muestra la tabla de usuarios y oculta el resumen', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Usuarios')

    expect(wrapper.find('.admin-menu__boton--activo').text()).toBe('Usuarios')
    expect(wrapper.find('.admin-usuarios').exists()).toBe(true)
    expect(wrapper.text()).toContain('pepe@test.com')
    expect(wrapper.text()).not.toContain('Requieren atención')
    expect(wrapper.find('.admin-solicitudes').exists()).toBe(false)
  })

  test('la sección Solicitudes muestra la tabla de solicitudes', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Solicitudes')

    expect(wrapper.find('.admin-menu__boton--activo').text()).toBe('Solicitudes')
    expect(wrapper.findAll('.admin-solicitudes tbody tr')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Cuidadores mejor valorados')
    expect(wrapper.find('.admin-usuarios').exists()).toBe(false)
  })

  test('la sección Pagos muestra las tarjetas, los gráficos y la tabla de detalle', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Pagos')

    expect(wrapper.find('.admin-menu__boton--activo').text()).toBe('Pagos')
    expect(wrapper.text()).toContain('Total cobrado')
    expect(wrapper.text()).toContain('66,7 %')
    expect(wrapper.text()).toContain('Pagos por mes')
    expect(wrapper.text()).toContain('Facturado por tipo de cuidado')
    expect(wrapper.text()).toContain('Hospitalario')
    expect(wrapper.text()).toContain('Cuidadores que más han cobrado')
    expect(wrapper.text()).toContain('Pepe Cobrador')
    expect(wrapper.text()).toContain('Detalle de pagos')
    expect(wrapper.findAll('.admin-pagos-tabla tbody tr')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Requieren atención')
  })

  test('sin cuidadores que hayan cobrado el top lo dice', async () => {
    prepararRepositorio({ pagosResumen: { ...PAGOS_RESUMEN, topCuidadores: [] } })
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Pagos')

    expect(wrapper.text()).toContain('Todavía no hay cuidadores con pagos cobrados.')
  })

  test('se puede volver a Resumen desde otra sección', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Usuarios')
    await irASeccion(wrapper, 'Resumen')

    expect(wrapper.text()).toContain('Requieren atención')
    expect(wrapper.find('.admin-usuarios').exists()).toBe(false)
  })

  test('cambiar de sección no vuelve a pedir los datos al servidor', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    await irASeccion(wrapper, 'Usuarios')
    await irASeccion(wrapper, 'Solicitudes')
    await irASeccion(wrapper, 'Pagos')

    expect(AdminRepository.prototype.getUsuarios).toHaveBeenCalledTimes(1)
    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenCalledTimes(1)
    expect(AdminRepository.prototype.getPagosResumen).toHaveBeenCalledTimes(1)
    expect(AdminRepository.prototype.getPagos).toHaveBeenCalledTimes(1)
  })

  test('las solicitudes y los pagos se piden sin filtro al empezar', async () => {
    prepararRepositorio()

    await montarVista()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenCalledWith('')
    expect(AdminRepository.prototype.getPagos).toHaveBeenCalledWith('')
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
    expect(wrapper.find('.admin-menu').exists()).toBe(false)
  })

  test('si fallan los pagos al cargar muestra el motivo y no el panel', async () => {
    prepararRepositorio()
    AdminRepository.prototype.getPagosResumen.mockRejectedValue(errorDelServidor(500))

    const wrapper = await montarVista()

    expect(wrapper.text()).toContain('No se pudo cargar el panel.')
    expect(wrapper.find('.admin-menu').exists()).toBe(false)
  })

  test('al cambiar el filtro vuelve a pedir las solicitudes de ese estado', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Solicitudes')

    await wrapper.find('select').setValue('ACEPTADA')
    await flushPromises()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenLastCalledWith('ACEPTADA')
    expect(wrapper.find('select').element.value).toBe('ACEPTADA')
  })

  test('el filtro de solicitudes se conserva al ir a otra sección y volver', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Solicitudes')
    await wrapper.find('select').setValue('RECHAZADA')
    await flushPromises()

    await irASeccion(wrapper, 'Usuarios')
    await irASeccion(wrapper, 'Solicitudes')

    expect(wrapper.find('select').element.value).toBe('RECHAZADA')
  })

  test('al cambiar el filtro de pagos vuelve a pedir los pagos de ese estado', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Pagos')

    await wrapper.find('.admin-pagos-tabla select').setValue('COMPLETADO')
    await flushPromises()

    expect(AdminRepository.prototype.getPagos).toHaveBeenLastCalledWith('COMPLETADO')
    expect(wrapper.find('.admin-pagos-tabla select').element.value).toBe('COMPLETADO')
  })

  test('si falla al filtrar los pagos muestra el motivo y mantiene la tabla', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Pagos')
    AdminRepository.prototype.getPagos.mockRejectedValue(errorDelServidor(500))

    await wrapper.find('.admin-pagos-tabla select').setValue('CANCELADO')
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudieron cargar los pagos.')
    expect(wrapper.findAll('.admin-pagos-tabla tbody tr')).toHaveLength(1)
  })

  test('el botón de los avisos abre Solicitudes con las pendientes', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()

    const boton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Ver solicitudes pendientes')
    await boton.trigger('click')
    await flushPromises()

    expect(AdminRepository.prototype.getSolicitudes).toHaveBeenLastCalledWith('PENDIENTE')
    expect(wrapper.find('.admin-menu__boton--activo').text()).toBe('Solicitudes')
    expect(wrapper.find('select').element.value).toBe('PENDIENTE')
  })

  test('si falla al filtrar muestra el motivo y mantiene la tabla', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Solicitudes')
    AdminRepository.prototype.getSolicitudes.mockRejectedValue(errorDelServidor(500))

    await wrapper.find('select').setValue('RECHAZADA')
    await flushPromises()

    expect(wrapper.text()).toContain('No se pudieron cargar las solicitudes.')
    expect(wrapper.findAll('.admin-solicitudes tbody tr')).toHaveLength(1)
  })

  test('bloquear a un usuario lo guarda, recarga la lista y lo confirma', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Usuarios')

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
    await irASeccion(wrapper, 'Usuarios')

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
    await irASeccion(wrapper, 'Usuarios')

    await wrapper.findAll('.admin-usuarios tbody tr')[1].find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se pudo cambiar el estado del usuario. No tienes permiso para hacer esto.'
    )
    expect(wrapper.text()).not.toContain('Usuario bloqueado.')
  })

  test('el mensaje de una acción desaparece al cambiar de sección', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Usuarios')
    await wrapper.findAll('.admin-usuarios tbody tr')[1].find('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Usuario bloqueado.')

    await irASeccion(wrapper, 'Solicitudes')

    expect(wrapper.text()).not.toContain('Usuario bloqueado.')
  })

  test('el administrador no tiene botón para bloquearse a sí mismo', async () => {
    prepararRepositorio()
    const wrapper = await montarVista()
    await irASeccion(wrapper, 'Usuarios')

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