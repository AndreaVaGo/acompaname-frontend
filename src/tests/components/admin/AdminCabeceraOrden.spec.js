import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminCabeceraOrden from '../../../components/admin/AdminCabeceraOrden.vue'

function montar(orden) {
  return mount(AdminCabeceraOrden, {
    props: { etiqueta: 'Fecha', clave: 'fecha', orden: orden },
    attachTo: document.createElement('tr'),
  })
}

describe('AdminCabeceraOrden', () => {
  test('enseña el nombre de la columna dentro de un botón', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    expect(wrapper.find('button').text()).toBe('Fecha')
  })

  test('al pulsar avisa con la clave de la columna', async () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('ordenar')[0]).toEqual(['fecha'])
  })

  test('si no está ordenada por ella, aria-sort es none y no tiene flecha', () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'asc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('none')
    expect(wrapper.find('button').attributes('data-direccion')).toBe('')
  })

  test('si está ordenada de menor a mayor lo dice con aria-sort y la flecha', () => {
    const wrapper = montar({ clave: 'fecha', direccion: 'asc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('ascending')
    expect(wrapper.find('button').attributes('data-direccion')).toBe('asc')
    expect(wrapper.find('button').classes()).toContain('admin-cabecera-orden__boton--activo')
  })

  test('si está ordenada al revés dice descending', () => {
    const wrapper = montar({ clave: 'fecha', direccion: 'desc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('descending')
  })
})
