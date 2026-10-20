import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminCuidadores from '../../../components/admin/AdminCuidadores.vue'

function montar(cuidadores) {
  return mount(AdminCuidadores, {
    props: { cuidadores: cuidadores },
  })
}

describe('AdminCuidadores', () => {
  test('muestra el nombre, la nota con coma y los servicios de cada cuidador', () => {
    const wrapper = montar([
      { id: 1, nombre: 'Marta Suárez', notaMedia: 4.9, serviciosCompletados: 12 },
      { id: 2, nombre: 'Rosa Álvarez', notaMedia: 4.5, serviciosCompletados: 7 },
    ])

    expect(wrapper.text()).toContain('Cuidadores mejor valorados')
    expect(wrapper.text()).toContain('Marta Suárez')
    expect(wrapper.text()).toContain('4,9 / 5')
    expect(wrapper.text()).toContain('12 servicios completados')
    expect(wrapper.text()).toContain('Rosa Álvarez')
    expect(wrapper.text()).toContain('4,5 / 5')
  })

  test('el círculo lleva la inicial del nombre', () => {
    const wrapper = montar([
      { id: 1, nombre: 'marta', notaMedia: 5, serviciosCompletados: 3 },
    ])

    expect(wrapper.find('.admin-cuidadores__inicial').text()).toBe('M')
  })

  test('con un solo servicio usa el singular', () => {
    const wrapper = montar([
      { id: 1, nombre: 'Marta', notaMedia: 5, serviciosCompletados: 1 },
    ])

    expect(wrapper.text()).toContain('1 servicio completado')
    expect(wrapper.text()).not.toContain('1 servicios')
  })

  test('sin cuidadores valorados lo dice', () => {
    const wrapper = montar([])

    expect(wrapper.text()).toContain('Todavía no hay cuidadores valorados.')
    expect(wrapper.findAll('.admin-cuidadores__fila').length).toBe(0)
  })
})