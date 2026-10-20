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

  test('no enseña datos privados de la solicitud', () => {
    const wrapper = montar(SOLICITUDES, '')

    expect(wrapper.text()).not.toContain('Rosa')
    expect(wrapper.text()).not.toContain('Juan')
  })

  test('el filtro tiene las cinco opciones y tiene elegida la actual', () => {
    const wrapper = montar(SOLICITUDES, 'ACEPTADA')

    const opciones = wrapper.findAll('option').map((opcion) => opcion.text())

    expect(opciones).toEqual(['Todos', 'Pendiente', 'Aceptada', 'Completada', 'Rechazada'])
    expect(wrapper.find('select').element.value).toBe('ACEPTADA')
  })

  test('al cambiar el filtro avisa con el estado elegido', async () => {
    const wrapper = montar(SOLICITUDES, '')

    await wrapper.find('select').setValue('PENDIENTE')

    expect(wrapper.emitted('cambiarEstado').length).toBe(1)
    expect(wrapper.emitted('cambiarEstado')[0]).toEqual(['PENDIENTE'])
  })

  test('elegir Todos avisa con el texto vacío', async () => {
    const wrapper = montar(SOLICITUDES, 'PENDIENTE')

    await wrapper.find('select').setValue('')

    expect(wrapper.emitted('cambiarEstado')[0]).toEqual([''])
  })

  test('sin solicitudes lo dice y mantiene el filtro', () => {
    const wrapper = montar([], 'RECHAZADA')

    expect(wrapper.text()).toContain('No hay solicitudes con este estado.')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('select').exists()).toBe(true)
  })
})