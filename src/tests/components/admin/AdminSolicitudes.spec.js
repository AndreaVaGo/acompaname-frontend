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
    .findAll('.admin-solicitudes__filtro')
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

    const pildoras = wrapper.findAll('.admin-solicitudes__pildora')

    expect(pildoras[0].classes()).toContain('admin-solicitudes__pildora--pendiente')
    expect(pildoras[1].classes()).toContain('admin-solicitudes__pildora--completada')
  })

  test('cada tipo de cuidado lleva su clase de color', () => {
    const wrapper = montar(SOLICITUDES, '')

    const tipos = wrapper.findAll('.admin-solicitudes__tipo')

    expect(tipos[0].classes()).toContain('admin-solicitudes__tipo--hospitalario')
    expect(tipos[1].classes()).toContain('admin-solicitudes__tipo--domicilio')
  })

  test('no enseña datos privados de la solicitud', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(wrapper.text()).not.toContain('Rosa')
    expect(wrapper.text()).not.toContain('Juan')
  })

  test('el filtro tiene cinco botones y marca el estado elegido', () => {
    const wrapper = montar(SOLICITUDES, 'ACEPTADA')

    const botones = wrapper.findAll('.admin-solicitudes__filtro')

    expect(botones.map((boton) => boton.text())).toEqual([
      'Todos',
      'Pendiente',
      'Aceptada',
      'Completada',
      'Rechazada',
    ])
    expect(botonFiltro(wrapper, 'Aceptada').classes()).toContain('admin-solicitudes__filtro--activo')
    expect(botonFiltro(wrapper, 'Aceptada').attributes('aria-pressed')).toBe('true')
    expect(botonFiltro(wrapper, 'Todos').attributes('aria-pressed')).toBe('false')
  })

  test('cada botón del filtro lleva el color de su estado', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(botonFiltro(wrapper, 'Pendiente').classes()).toContain('admin-solicitudes__filtro--pendiente')
    expect(botonFiltro(wrapper, 'Aceptada').classes()).toContain('admin-solicitudes__filtro--aceptada')
    expect(botonFiltro(wrapper, 'Completada').classes()).toContain('admin-solicitudes__filtro--completada')
    expect(botonFiltro(wrapper, 'Rechazada').classes()).toContain('admin-solicitudes__filtro--rechazada')
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
    expect(wrapper.findAll('.admin-solicitudes__filtro').length).toBe(5)
    expect(botonFiltro(wrapper, 'Rechazada').classes()).toContain('admin-solicitudes__filtro--activo')
  })
})