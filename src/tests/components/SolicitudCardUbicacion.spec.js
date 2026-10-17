import { describe, test, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function montarTarjeta(tipoCuidado, direccion, estado, mostrarAcciones) {
  return mount(SolicitudCard, {
    props: {
      solicitud: {
        id: 1,
        nombrePaciente: 'Antonio Serrano',
        tipoCuidado: tipoCuidado,
        direccion: direccion,
        fechaCuidado: '2026-08-12',
        estado: estado,
      },
      nombreMostrado: 'cuidador demo',
      mostrarAcciones: mostrarAcciones,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('SolicitudCard dirección en negrita', () => {
  test('en un hospital toda la dirección va en negrita', () => {
    const wrapper = montarTarjeta(
      'hospitalario',
      'Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214',
      'ACEPTADA',
      false,
    )

    expect(wrapper.find('.solicitudes__direccion').text()).toBe(
      'Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214',
    )
  })

  test('en un domicilio toda la dirección va en negrita', () => {
    const wrapper = montarTarjeta(
      'domicilio',
      'Calle Uría 12, 3º B, Oviedo',
      'ACEPTADA',
      false,
    )

    expect(wrapper.find('.solicitudes__direccion').text()).toBe(
      'Calle Uría 12, 3º B, Oviedo',
    )
  })

  test('el cuidador no ve la dirección hasta que acepta la solicitud', async () => {
    const wrapper = montarTarjeta(
      'domicilio',
      'Calle Uría 12, 3º B, Oviedo',
      'PENDIENTE',
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    expect(wrapper.find('.solicitudes__direccion').exists()).toBe(false)
    expect(wrapper.text()).toContain(
      'La dirección se mostrará cuando aceptes la solicitud',
    )
    expect(wrapper.text()).not.toContain('Calle Uría 12')
  })

  test('el cuidador ve la dirección en negrita cuando ya ha aceptado', async () => {
    const wrapper = montarTarjeta(
      'hospitalario',
      'HUCA, planta 2, sección B',
      'ACEPTADA',
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    expect(wrapper.find('.solicitudes__direccion').text()).toBe(
      'HUCA, planta 2, sección B',
    )
  })
})