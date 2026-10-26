import { describe, test, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function crearSolicitud(estado) {
  return {
    id: 1,
    nombrePaciente: 'Antonio Serrano',
    tipoCuidado: 'hospitalario',
    fechaCuidado: '2026-08-12',
    estado: estado,
  }
}

// Tarjeta tal y como la ve la familia. Por defecto el pago ya está hecho,
// así el único enlace que queda en la tarjeta es el de valorar
function montarTarjetaFamilia(estado, valorada, pagado = true) {
  return mount(SolicitudCard, {
    props: {
      solicitud: crearSolicitud(estado),
      nombreMostrado: 'cuidador demo',
      mostrarAcciones: false,
      valorada: valorada,
      pagado: pagado,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

// Tarjeta tal y como la ve el cuidador
function montarTarjetaCuidador(estado, valorada) {
  return mount(SolicitudCard, {
    props: {
      solicitud: crearSolicitud(estado),
      nombreMostrado: 'Familia Serrano',
      mostrarAcciones: true,
      valorada: valorada,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('SolicitudCard valoración', () => {
  test('una solicitud completada sin valorar muestra el botón Dejar valoración', () => {
    const wrapper = montarTarjetaFamilia('COMPLETADA', false)

    expect(wrapper.text()).toContain('Dejar valoración')
    expect(wrapper.text()).not.toContain('Valoración enviada')
  })

  test('el botón Dejar valoración lleva a la página de valorar esa solicitud', () => {
    const wrapper = montarTarjetaFamilia('COMPLETADA', false)

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/valorar/1')
  })

  test('una solicitud completada y valorada muestra Valoración enviada y no el botón', () => {
    const wrapper = montarTarjetaFamilia('COMPLETADA', true)

    expect(wrapper.text()).toContain('Valoración enviada ✓')
    expect(wrapper.text()).not.toContain('Dejar valoración')
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  test('una solicitud completada sin pagar ni valorar muestra los dos enlaces', () => {
    const wrapper = montarTarjetaFamilia('COMPLETADA', false, false)

    const enlaces = wrapper.findAllComponents(RouterLinkStub)
    expect(enlaces.length).toBe(2)
    expect(enlaces[0].props('to')).toBe('/pagar/1')
    expect(enlaces[1].props('to')).toBe('/valorar/1')
  })

  test('una solicitud completada, pagada y valorada no muestra ningún enlace', () => {
    const wrapper = montarTarjetaFamilia('COMPLETADA', true, true)

    expect(wrapper.text()).toContain('Pagado ✓')
    expect(wrapper.text()).toContain('Valoración enviada ✓')
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  test('una solicitud pendiente no muestra nada de valoración', () => {
    const wrapper = montarTarjetaFamilia('PENDIENTE', false)

    expect(wrapper.text()).not.toContain('Dejar valoración')
    expect(wrapper.text()).not.toContain('Valoración enviada')
  })

  test('una solicitud aceptada no muestra nada de valoración', () => {
    const wrapper = montarTarjetaFamilia('ACEPTADA', false)

    expect(wrapper.text()).not.toContain('Dejar valoración')
    expect(wrapper.text()).not.toContain('Valoración enviada')
  })

  test('el cuidador no ve el botón de valorar en una solicitud completada sin valorar', () => {
    const wrapper = montarTarjetaCuidador('COMPLETADA', false)

    expect(wrapper.text()).not.toContain('Dejar valoración')
    expect(wrapper.text()).not.toContain('Valoración enviada')
  })

  test('el cuidador tampoco ve nada de valoración en una solicitud completada y valorada', () => {
    const wrapper = montarTarjetaCuidador('COMPLETADA', true)

    expect(wrapper.text()).not.toContain('Dejar valoración')
    expect(wrapper.text()).not.toContain('Valoración enviada')
  })
})