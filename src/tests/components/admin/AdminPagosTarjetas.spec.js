import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagosTarjetas from '../../../components/admin/AdminPagosTarjetas.vue'

const RESUMEN = {
  totalCobrado: 54,
  totalPendiente: 36,
  numeroCobrados: 2,
  numeroPendientes: 1,
  numeroCancelados: 1,
  importeMedio: 30,
  porcentajeCobrado: 66.7,
  pendientesMasDeSieteDias: 1,
  importePendienteMasDeSieteDias: 36,
}

function montar(cambios) {
  return mount(AdminPagosTarjetas, {
    props: { resumen: { ...RESUMEN, ...cambios } },
  })
}

describe('AdminPagosTarjetas', () => {
  test('muestra lo cobrado y lo pendiente en euros con su número de pagos', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('Total cobrado')
    expect(wrapper.text()).toContain('54,00 €')
    expect(wrapper.text()).toContain('2 pagos')
    expect(wrapper.text()).toContain('Pendiente de cobro')
    expect(wrapper.text()).toContain('36,00 €')
    expect(wrapper.text()).toContain('1 pago')
  })

  test('el porcentaje cobrado sale con coma y sobre los pagos facturados', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('66,7 %')
    expect(wrapper.text()).toContain('de 3 pagos facturados')
  })

  test('sin pagos facturados el porcentaje sale como un guion', () => {
    const wrapper = montar({ porcentajeCobrado: null, numeroCobrados: 0, numeroPendientes: 0 })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.text()).not.toContain('%')
  })

  test('muestra el importe medio por pago', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('Importe medio')
    expect(wrapper.text()).toContain('30,00 €')
  })

  test('avisa de los pendientes de más de 7 días y del importe en riesgo', () => {
    const wrapper = montar({ pendientesMasDeSieteDias: 4, importePendienteMasDeSieteDias: 120.5 })

    expect(wrapper.text()).toContain('Sin cobrar más de 7 días')
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('120,50 € en riesgo')
  })
})