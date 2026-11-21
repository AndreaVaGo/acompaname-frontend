import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminSolicitudes from '../../../components/admin/AdminSolicitudes.vue'

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
  {
    id: 2,
    tipoCuidado: 'domicilio',
    nombrePaciente: 'Juan',
    fechaCuidado: '2026-10-21',
    estado: 'COMPLETADA',
    nombreFamilia: 'Luis',
    nombreCuidador: 'Marta',
  },
]

function montar(solicitudes, estado) {
  return mount(AdminSolicitudes, {
    props: { solicitudes: solicitudes, estado: estado },
  })
}

// El botón del filtro con ese nombre (Todos, Pendiente, Aceptada...)
function botonFiltro(wrapper, nombre) {
  return wrapper
    .findAll('.admin-filtros__boton')
    .find((boton) => boton.text() === nombre)
}

describe('AdminSolicitudes', () => {
  test('muestra el tipo, la familia, el cuidador, la fecha y el estado', () => {
    const wrapper = montar(SOLICITUDES, '')

    const filas = wrapper.findAll('tbody tr')

    expect(filas.length).toBe(2)
    expect(filas[0].text()).toContain('Hospitalario')
    expect(filas[0].text()).toContain('Ana')
    expect(filas[0].text()).toContain('Pepe')
    expect(filas[0].text()).toContain('22-10-2026')
    expect(filas[0].text()).toContain('Pendiente')
    expect(filas[1].text()).toContain('Domicilio')
    expect(filas[1].text()).toContain('Completada')
  })

  test('cada estado lleva su clase de color', () => {
    const wrapper = montar(SOLICITUDES, '')

    const pildoras = wrapper.findAll('tbody .admin-pildora--punto')

    expect(pildoras[0].classes()).toContain('admin-pildora--naranja')
    expect(pildoras[1].classes()).toContain('admin-pildora--azul')
  })

  test('cada tipo de cuidado lleva su clase de color', () => {
    const wrapper = montar(SOLICITUDES, '')

    const tipos = wrapper.findAll('tbody tr').map((fila) => fila.findAll('.admin-pildora')[0])

    expect(tipos[0].classes()).toContain('admin-pildora--azul')
    expect(tipos[1].classes()).toContain('admin-pildora--verde')
  })

  test('no enseña datos privados de la solicitud', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(wrapper.text()).not.toContain('Rosa')
    expect(wrapper.text()).not.toContain('Juan')
  })

  test('el filtro tiene cinco botones y marca el estado elegido', () => {
    const wrapper = montar(SOLICITUDES, 'ACEPTADA')

    const botones = wrapper.findAll('.admin-filtros__boton')

    expect(botones.map((boton) => boton.text())).toEqual([
      'Todos',
      'Pendiente',
      'Aceptada',
      'Completada',
      'Rechazada',
    ])
    expect(botonFiltro(wrapper, 'Aceptada').classes()).toContain('admin-filtros__boton--activo')
    expect(botonFiltro(wrapper, 'Aceptada').attributes('aria-pressed')).toBe('true')
    expect(botonFiltro(wrapper, 'Todos').attributes('aria-pressed')).toBe('false')
  })

  test('cada botón del filtro lleva el color de su estado', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(botonFiltro(wrapper, 'Pendiente').classes()).toContain('admin-filtros__boton--naranja')
    expect(botonFiltro(wrapper, 'Aceptada').classes()).toContain('admin-filtros__boton--verde')
    expect(botonFiltro(wrapper, 'Completada').classes()).toContain('admin-filtros__boton--azul')
    expect(botonFiltro(wrapper, 'Rechazada').classes()).toContain('admin-filtros__boton--gris')
  })

  test('al pulsar un botón avisa con el estado elegido', async () => {
    const wrapper = montar(SOLICITUDES, '')

    await botonFiltro(wrapper, 'Pendiente').trigger('click')

    expect(wrapper.emitted('cambiarEstado').length).toBe(1)
    expect(wrapper.emitted('cambiarEstado')[0]).toEqual(['PENDIENTE'])
  })

  test('pulsar Todos avisa con el texto vacío', async () => {
    const wrapper = montar(SOLICITUDES, 'PENDIENTE')

    await botonFiltro(wrapper, 'Todos').trigger('click')

    expect(wrapper.emitted('cambiarEstado')[0]).toEqual([''])
  })

  test('sin solicitudes lo dice y mantiene el filtro', () => {
    const wrapper = montar([], 'RECHAZADA')

    expect(wrapper.text()).toContain('No hay solicitudes con este estado.')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.findAll('.admin-filtros__boton').length).toBe(5)
    expect(botonFiltro(wrapper, 'Rechazada').classes()).toContain('admin-filtros__boton--activo')
  })

  test('la tabla va dentro del contenedor con los estilos compartidos', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(wrapper.find('.admin-tabla table').exists()).toBe(true)
  })
})

// Pulsa una flecha de la cabecera de una columna: direccion es 'asc' (▲) o 'desc' (▼)
function pulsarFlecha(wrapper, nombre, direccion) {
  const cabecera = wrapper
    .findAll('th')
    .find((th) => th.find('.admin-cabecera-orden__texto').text() === nombre)
  return cabecera.find(`button[data-direccion="${direccion}"]`).trigger('click')
}

function familias(wrapper) {
  return wrapper.findAll('tbody tr').map((fila) => fila.find('td[data-label="Familia"]').text())
}

describe('AdminSolicitudes · ordenar', () => {
  test('al principio salen en el orden en que llegan', () => {
    expect(familias(montar(SOLICITUDES, ''))).toEqual(['Ana', 'Luis'])
  })

  test('con ▲ en Fecha salen primero las más antiguas y con ▼ las más nuevas', async () => {
    const wrapper = montar(SOLICITUDES, '')

    await pulsarFlecha(wrapper, 'Fecha', 'asc')
    expect(familias(wrapper)).toEqual(['Luis', 'Ana'])

    await pulsarFlecha(wrapper, 'Fecha', 'desc')
    expect(familias(wrapper)).toEqual(['Ana', 'Luis'])
  })

  test('al ordenar por Estado sigue el flujo: pendiente antes que completada', async () => {
    const wrapper = montar([SOLICITUDES[1], SOLICITUDES[0]], '')

    await pulsarFlecha(wrapper, 'Estado', 'asc')

    expect(familias(wrapper)).toEqual(['Ana', 'Luis'])
  })

  test('al ordenar por Persona cuidadora usa el nombre de la persona cuidadora', async () => {
    const wrapper = montar(SOLICITUDES, '')

    await pulsarFlecha(wrapper, 'Persona cuidadora', 'asc')

    expect(familias(wrapper)).toEqual(['Luis', 'Ana'])
  })

  test('no cambia la lista original que recibe', async () => {
    const lista = [...SOLICITUDES]
    const wrapper = montar(lista, '')

    await pulsarFlecha(wrapper, 'Fecha', 'asc')

    expect(lista.map((s) => s.id)).toEqual([1, 2])
  })
})
