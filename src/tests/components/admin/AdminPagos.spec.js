import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagos from '../../../components/admin/AdminPagos.vue'

describe('AdminPagos', () => {
  test('muestra lo cobrado y lo pendiente en euros', () => {
    const wrapper = mount(AdminPagos, {
      props: { cobrados: 1260, pendientes: 340.5 },
    })

    expect(wrapper.text()).toContain('Pagos')
    expect(wrapper.find('.admin-pagos__caja--cobrados').text()).toContain('Pagados')
    expect(wrapper.find('.admin-pagos__caja--cobrados').text()).toContain('1.260,00 €')
    expect(wrapper.find('.admin-pagos__caja--pendientes').text()).toContain('Pendientes')
    expect(wrapper.find('.admin-pagos__caja--pendientes').text()).toContain('340,50 €')
  })

  test('sin pagos enseña cero euros', () => {
    const wrapper = mount(AdminPagos, {
      props: { cobrados: 0, pendientes: 0 },
    })

    expect(wrapper.findAll('.admin-pagos__importe')[0].text()).toBe('0,00 €')
    expect(wrapper.findAll('.admin-pagos__importe')[1].text()).toBe('0,00 €')
  })
})