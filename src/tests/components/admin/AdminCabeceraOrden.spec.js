import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminCabeceraOrden from '../../../components/admin/AdminCabeceraOrden.vue'

function montar(orden) {
  return mount(AdminCabeceraOrden, {
    props: { etiqueta: 'Fecha', clave: 'fecha', orden: orden },
    attachTo: document.createElement('tr'),
  })
}

function flecha(wrapper, direccion) {
  return wrapper.find(`button[data-direccion="${direccion}"]`)
}

describe('AdminCabeceraOrden', () => {
  test('enseña el nombre de la columna y dos flechas', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    expect(wrapper.find('.admin-cabecera-orden__texto').text()).toBe('Fecha')
    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(flecha(wrapper, 'asc').text()).toBe('▲')
    expect(flecha(wrapper, 'desc').text()).toBe('▼')
  })

  test('las flechas dicen para qué sirven a los lectores de pantalla', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    expect(flecha(wrapper, 'asc').attributes('aria-label')).toBe('Ordenar Fecha de menor a mayor')
    expect(flecha(wrapper, 'desc').attributes('aria-label')).toBe('Ordenar Fecha de mayor a menor')
  })

  test('un clic en ▲ avisa con la columna y de menor a mayor', async () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    await flecha(wrapper, 'asc').trigger('click')

    expect(wrapper.emitted('ordenar')[0]).toEqual([{ clave: 'fecha', direccion: 'asc' }])
  })

  test('un clic en ▼ avisa con la columna y de mayor a menor', async () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    await flecha(wrapper, 'desc').trigger('click')

    expect(wrapper.emitted('ordenar')[0]).toEqual([{ clave: 'fecha', direccion: 'desc' }])
  })

  test('si no está ordenada por ella, aria-sort es none y ninguna flecha está encendida', () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'asc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('none')
    expect(wrapper.findAll('.admin-cabecera-orden__flecha--activa')).toHaveLength(0)
  })

  test('si está ordenada de menor a mayor se enciende solo ▲', () => {
    const wrapper = montar({ clave: 'fecha', direccion: 'asc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('ascending')
    expect(flecha(wrapper, 'asc').classes()).toContain('admin-cabecera-orden__flecha--activa')
    expect(flecha(wrapper, 'asc').attributes('aria-pressed')).toBe('true')
    expect(flecha(wrapper, 'desc').classes()).not.toContain('admin-cabecera-orden__flecha--activa')
  })

  test('si está ordenada al revés se enciende solo ▼ y aria-sort dice descending', () => {
    const wrapper = montar({ clave: 'fecha', direccion: 'desc' })

    expect(wrapper.find('th').attributes('aria-sort')).toBe('descending')
    expect(flecha(wrapper, 'desc').classes()).toContain('admin-cabecera-orden__flecha--activa')
    expect(flecha(wrapper, 'asc').classes()).not.toContain('admin-cabecera-orden__flecha--activa')
  })
})
