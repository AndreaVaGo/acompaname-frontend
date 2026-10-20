import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminAvisos from '../../../components/admin/AdminAvisos.vue'

function montar(proximas, vencidas, pagos) {
  return mount(AdminAvisos, {
    props: {
      avisos: {
        pendientesProximas48Horas: proximas,
        pendientesVencidas: vencidas,
        pagosSinCobrarMasDeUnaSemana: pagos,
      },
    },
  })
}

describe('AdminAvisos', () => {
  test('muestra una frase por cada aviso con cantidad', () => {
    const wrapper = montar(3, 2, 4)

    expect(wrapper.text()).toContain('Requieren atención')
    expect(wrapper.text()).toContain(
      '3 solicitudes pendientes con fecha en las próximas 48 horas.'
    )
    expect(wrapper.text()).toContain(
      '2 solicitudes pendientes cuya fecha ya ha pasado.'
    )
    expect(wrapper.text()).toContain(
      '4 pagos sin cobrar desde hace más de una semana.'
    )
  })

  test('con una sola unidad usa el singular', () => {
    const wrapper = montar(1, 1, 1)

    expect(wrapper.text()).toContain(
      '1 solicitud pendiente con fecha en las próximas 48 horas.'
    )
    expect(wrapper.text()).toContain('1 solicitud pendiente cuya fecha ya ha pasado.')
    expect(wrapper.text()).toContain('1 pago sin cobrar desde hace más de una semana.')
  })

  test('no muestra los avisos que están a cero', () => {
    const wrapper = montar(0, 2, 0)

    expect(wrapper.findAll('li').length).toBe(1)
    expect(wrapper.text()).toContain('cuya fecha ya ha pasado')
    expect(wrapper.text()).not.toContain('próximas 48 horas')
    expect(wrapper.text()).not.toContain('pagos sin cobrar')
  })

  test('si no hay ningún aviso dice que todo está en orden y no hay botón', () => {
    const wrapper = montar(0, 0, 0)

    expect(wrapper.text()).toContain('Todo en orden')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  test('el botón avisa de que se quieren ver las solicitudes pendientes', async () => {
    const wrapper = montar(1, 0, 0)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('verPendientes').length).toBe(1)
  })

  test('si solo hay pagos sin cobrar no sale el botón de solicitudes', () => {
    const wrapper = montar(0, 0, 2)

    expect(wrapper.text()).toContain('2 pagos sin cobrar')
    expect(wrapper.find('button').exists()).toBe(false)
  })
})