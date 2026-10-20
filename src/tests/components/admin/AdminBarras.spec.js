import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminBarras from '../../../components/admin/AdminBarras.vue'

function montar(filas, nota) {
  return mount(AdminBarras, {
    props: {
      titulo: 'Solicitudes por estado',
      filas: filas,
      nota: nota,
    },
  })
}

describe('AdminBarras', () => {
  test('muestra el título, el texto y la cantidad de cada fila', () => {
    const wrapper = montar([
      { texto: 'Pendientes', cantidad: 10, color: 'red' },
      { texto: 'Aceptadas', cantidad: 30, color: 'green' },
    ])

    expect(wrapper.text()).toContain('Solicitudes por estado')
    expect(wrapper.text()).toContain('Pendientes')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('Aceptadas')
    expect(wrapper.text()).toContain('30')
  })

  test('cada barra mide el porcentaje que su cantidad supone sobre el total', () => {
    const wrapper = montar([
      { texto: 'Pendientes', cantidad: 10, color: 'red' },
      { texto: 'Aceptadas', cantidad: 30, color: 'green' },
    ])

    const barras = wrapper.findAll('.admin-barras__relleno')

    expect(barras[0].attributes('style')).toContain('width: 25%')
    expect(barras[1].attributes('style')).toContain('width: 75%')
  })

  test('si todas las cantidades son cero, las barras miden cero y no falla', () => {
    const wrapper = montar([
      { texto: 'Pendientes', cantidad: 0, color: 'red' },
      { texto: 'Aceptadas', cantidad: 0, color: 'green' },
    ])

    const barras = wrapper.findAll('.admin-barras__relleno')

    expect(barras[0].attributes('style')).toContain('width: 0%')
    expect(barras[1].attributes('style')).toContain('width: 0%')
  })

  test('la nota solo se muestra si se indica', () => {
    const sinNota = montar([{ texto: 'Domicilio', cantidad: 5, color: 'red' }])
    const conNota = montar(
      [{ texto: 'Domicilio', cantidad: 5, color: 'red' }],
      'Tiempo medio hasta aceptar una solicitud: 5 h.'
    )

    expect(sinNota.find('.admin-barras__nota').exists()).toBe(false)
    expect(conNota.find('.admin-barras__nota').text()).toBe(
      'Tiempo medio hasta aceptar una solicitud: 5 h.'
    )
  })
})