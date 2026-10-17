import { describe, test, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function montarTarjeta(tipoCuidado, direccion) {
  return mount(SolicitudCard, {
    props: {
      solicitud: {
        id: 1,
        nombrePaciente: 'Antonio Serrano',
        tipoCuidado: tipoCuidado,
        direccion: direccion,
        fechaCuidado: '2026-08-12',
        estado: 'ACEPTADA',
      },
      nombreMostrado: 'cuidador demo',
      mostrarAcciones: false,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('SolicitudCard ubicación del hospital', () => {
  test('en un hospital pone en negrita lo que va detrás del nombre', () => {
    const wrapper = montarTarjeta(
      'hospitalario',
      'Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214',
    )

    expect(wrapper.find('.solicitudes__ubicacion').text()).toBe(
      'Planta 2, Medicina Interna, habitación 214',
    )
    expect(wrapper.text()).toContain('Hospital de Cabueñes')
  })

  test('el nombre del hospital no va en negrita', () => {
    const wrapper = montarTarjeta(
      'hospitalario',
      'Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214',
    )

    expect(wrapper.find('.solicitudes__ubicacion').text()).not.toContain(
      'Hospital de Cabueñes',
    )
  })

  test('en un domicilio no pone nada en negrita', () => {
    const wrapper = montarTarjeta('domicilio', 'Calle Uría 12, 3º B, Oviedo')

    expect(wrapper.find('.solicitudes__ubicacion').exists()).toBe(false)
    expect(wrapper.text()).toContain('Calle Uría 12, 3º B, Oviedo')
  })

  test('si el hospital no tiene coma no pone nada en negrita', () => {
    const wrapper = montarTarjeta('hospitalario', 'Hospital de Cabueñes')

    expect(wrapper.find('.solicitudes__ubicacion').exists()).toBe(false)
    expect(wrapper.text()).toContain('Hospital de Cabueñes')
  })

  test('también funciona si el tipo llega con la primera letra en mayúscula', () => {
    const wrapper = montarTarjeta('Hospitalario', 'HUCA, planta 2, sección B')

    expect(wrapper.find('.solicitudes__ubicacion').text()).toBe(
      'planta 2, sección B',
    )
  })
})