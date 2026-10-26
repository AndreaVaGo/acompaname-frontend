import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagosMeses from '../../../components/admin/AdminPagosMeses.vue'

const MESES = [
  { mes: '2026-09', cobrado: 50, pendiente: 0 },
  { mes: '2026-10', cobrado: 25, pendiente: 25 },
]

function montar(meses) {
  return mount(AdminPagosMeses, { props: { meses: meses } })
}

describe('AdminPagosMeses', () => {
  test('muestra una columna por mes con su nombre y su importe total', () => {
    const wrapper = montar(MESES)

    const columnas = wrapper.findAll('.admin-pagos-meses__columna')

    expect(columnas.length).toBe(2)
    expect(columnas[0].text()).toContain('sep 2026')
    expect(columnas[0].text()).toContain('50,00 €')
    expect(columnas[1].text()).toContain('oct 2026')
    expect(columnas[1].text()).toContain('50,00 €')
  })

  test('el mes con más importe llena la columna y los demás se miden contra él', () => {
    const wrapper = montar([
      { mes: '2026-09', cobrado: 50, pendiente: 0 },
      { mes: '2026-10', cobrado: 25, pendiente: 0 },
    ])

    const cobrados = wrapper.findAll('.admin-pagos-meses__tramo--cobrado')

    expect(cobrados[0].attributes('style')).toContain('height: 100%')
    expect(cobrados[1].attributes('style')).toContain('height: 50%')
  })

  test('cada columna reparte la altura entre lo cobrado y lo pendiente', () => {
    const wrapper = montar(MESES)

    const columnaOctubre = wrapper.findAll('.admin-pagos-meses__columna')[1]

    expect(columnaOctubre.find('.admin-pagos-meses__tramo--cobrado').attributes('style')).toContain(
      'height: 50%'
    )
    expect(columnaOctubre.find('.admin-pagos-meses__tramo--pendiente').attributes('style')).toContain(
      'height: 50%'
    )
  })

  test('cada columna describe el mes al pasar el ratón', () => {
    const wrapper = montar(MESES)

    const titulo = wrapper.findAll('.admin-pagos-meses__columna')[1].attributes('title')

    expect(titulo).toBe('oct 2026: cobrado 25,00 €, pendiente 25,00 €')
  })

  test('muestra la leyenda de colores cuando hay pagos', () => {
    const wrapper = montar(MESES)

    expect(wrapper.text()).toContain('Cobrado')
    expect(wrapper.text()).toContain('Pendiente')
  })

  test('sin pagos en ningún mes lo dice y no pinta columnas', () => {
    const wrapper = montar([
      { mes: '2026-09', cobrado: 0, pendiente: 0 },
      { mes: '2026-10', cobrado: 0, pendiente: 0 },
    ])

    expect(wrapper.text()).toContain('Todavía no hay pagos en estos meses.')
    expect(wrapper.find('.admin-pagos-meses__columna').exists()).toBe(false)
  })
})