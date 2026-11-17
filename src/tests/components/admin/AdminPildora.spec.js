import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPildora from '../../../components/admin/AdminPildora.vue'

describe('AdminPildora', () => {
  test('enseña el texto que lleva dentro', () => {
    const wrapper = mount(AdminPildora, { slots: { default: 'Pendiente' } })

    expect(wrapper.text()).toBe('Pendiente')
  })

  test('sin color es gris y sin punto', () => {
    const wrapper = mount(AdminPildora, { slots: { default: 'Hola' } })

    expect(wrapper.classes()).toContain('admin-pildora--gris')
    expect(wrapper.classes()).not.toContain('admin-pildora--punto')
  })

  test('lleva la clase del color que se le da', () => {
    const colores = ['naranja', 'verde', 'azul', 'gris', 'rojo']

    for (const color of colores) {
      const wrapper = mount(AdminPildora, { props: { color: color }, slots: { default: 'x' } })

      expect(wrapper.classes()).toContain('admin-pildora--' + color)
    }
  })

  test('con punto lleva la clase del puntito', () => {
    const wrapper = mount(AdminPildora, {
      props: { color: 'verde', punto: true },
      slots: { default: 'Activo' },
    })

    expect(wrapper.classes()).toContain('admin-pildora--punto')
  })
})
