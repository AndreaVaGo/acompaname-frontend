import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminTarjetas from '../../../components/admin/AdminTarjetas.vue'

function estadisticas(cambios) {
  const datos = {
    totalFamilias: 18,
    totalCuidadores: 9,
    cuidadoresDisponibles: 4,
    solicitudesPendientes: 10,
    solicitudesAceptadas: 7,
    solicitudesRechazadas: 6,
    solicitudesCompletadas: 19,
    solicitudesHospital: 27,
    solicitudesDomicilio: 15,
    ingresosCobrados: 1260,
    ingresosPendientes: 340,
    valoracionMedia: 4.6,
    horasMediasHastaAceptar: 5.0,
  }
  return { ...datos, ...cambios }
}

function montar(cambios) {
  return mount(AdminTarjetas, {
    props: { estadisticas: estadisticas(cambios) },
  })
}

describe('AdminTarjetas', () => {
  test('muestra las familias y los cuidadores con los disponibles ahora', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('Familias')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('Cuidadores')
    expect(wrapper.text()).toContain('9')
    expect(wrapper.text()).toContain('4 disponibles ahora')
  })

  test('el total de solicitudes es la suma de los cuatro estados', () => {
    const wrapper = montar()

    // 10 + 7 + 19 + 6 = 42
    expect(wrapper.text()).toContain('Solicitudes')
    expect(wrapper.text()).toContain('42')
  })

  test('los ingresos cobrados se muestran en euros', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('Ingresos cobrados')
    expect(wrapper.text()).toContain('1.260,00 €')
  })

  test('la valoración media se muestra con coma y sobre 5', () => {
    const wrapper = montar()

    expect(wrapper.text()).toContain('4,6')
    expect(wrapper.text()).toContain('/ 5')
  })

  test('sin valoraciones se muestra un guion y no el sobre 5', () => {
    const wrapper = montar({ valoracionMedia: null })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.text()).not.toContain('/ 5')
  })
})