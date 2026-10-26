import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagosBarras from '../../../components/admin/AdminPagosBarras.vue'

const FILAS = [
  { texto: 'Hospitalario', importe: 100, detalle: '4 pagos' },
  { texto: 'Domicilio', importe: 50, detalle: '1 pago' },
]

function montar(filas, extra) {
  return mount(AdminPagosBarras, {
    props: { titulo: 'Facturado por tipo de cuidado', filas: filas, ...extra },
  })
}

describe('AdminPagosBarras', () => {
  test('muestra el título y cada fila con su texto, su importe y su detalle', () => {
    const wrapper = montar(FILAS)

    expect(wrapper.text()).toContain('Facturado por tipo de cuidado')
    expect(wrapper.text()).toContain('Hospitalario')
    expect(wrapper.text()).toContain('100,00 €')
    expect(wrapper.text()).toContain('4 pagos')
    expect(wrapper.text()).toContain('Domicilio')
    expect(wrapper.text()).toContain('50,00 €')
  })

  test('la fila de mayor importe llena la barra y las demás se miden contra ella', () => {
    const wrapper = montar(FILAS)

    const rellenos = wrapper.findAll('.admin-pagos-barras__relleno')

    expect(rellenos[0].attributes('style')).toContain('width: 100%')
    expect(rellenos[1].attributes('style')).toContain('width: 50%')
  })

  test('si todos los importes son cero las barras quedan vacías', () => {
    const wrapper = montar([
      { texto: 'Hospitalario', importe: 0, detalle: '0 pagos' },
      { texto: 'Domicilio', importe: 0, detalle: '0 pagos' },
    ])

    const rellenos = wrapper.findAll('.admin-pagos-barras__relleno')

    expect(rellenos[0].attributes('style')).toContain('width: 0%')
    expect(rellenos[1].attributes('style')).toContain('width: 0%')
  })

  test('el detalle es opcional', () => {
    const wrapper = montar([{ texto: 'Pepe', importe: 10 }])

    expect(wrapper.find('small').exists()).toBe(false)
  })

  test('sin filas muestra el mensaje de vacío', () => {
    const wrapper = montar([], { vacio: 'Todavía no hay cuidadores con pagos cobrados.' })

    expect(wrapper.text()).toContain('Todavía no hay cuidadores con pagos cobrados.')
    expect(wrapper.find('.admin-pagos-barras__fila').exists()).toBe(false)
  })
})