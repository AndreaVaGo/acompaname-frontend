import { describe, test, expect } from 'vitest'
import { mount, shallowMount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function crearSolicitud(estado) {
  return {
    id: 1,
    nombrePaciente: 'Antonio Serrano',
    tipoCuidado: 'Hospitalario',
    fechaCuidado: '2026-08-12',
    notas: 'Ingreso previsto de 4 noches.',
    estado: estado,
  }
}

function montarTarjeta(estado, pagado) {
  return mount(SolicitudCard, {
    props: {
      solicitud: crearSolicitud(estado),
      nombreMostrado: 'Familia Serrano',
      mostrarAcciones: false,
      pagado: pagado,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('SolicitudCard', () => {
  test('muestra el nombre correcto', () => {
    const solicitud = {
      paciente: 'Antonio Serrano',
      tipoCuidado: 'Hospitalario',
      fechaInicio: '12 de agosto de 2026',
      notas: 'Ingreso previsto de 4 noches.',
      estado: 'pendiente',
    }

    const wrapper = shallowMount(SolicitudCard, {
      props: {
        solicitud: solicitud,
        nombreMostrado: 'Familia Serrano',
        mostrarAcciones: false,
      },
    })

    expect(wrapper.text()).toContain('Familia Serrano')
  })

  test('muestra el botón Pagar si la solicitud está aceptada y sin pagar', () => {
    const wrapper = montarTarjeta('ACEPTADA', false)

    expect(wrapper.text()).toContain('Pagar')
    expect(wrapper.text()).not.toContain('Pagado')
  })

  test('muestra Pagado en vez del botón si el pago ya está hecho', () => {
    const wrapper = montarTarjeta('ACEPTADA', true)

    expect(wrapper.text()).toContain('Pagado')
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  test('no muestra ni Pagar ni Pagado si la solicitud está pendiente', () => {
    const wrapper = montarTarjeta('PENDIENTE', false)

    expect(wrapper.text()).not.toContain('Pagar')
    expect(wrapper.text()).not.toContain('Pagado')
  })

  test('muestra las notas si la solicitud tiene notas', () => {
    const wrapper = montarTarjeta('PENDIENTE', false)

    expect(wrapper.text()).toContain('Ingreso previsto de 4 noches.')
  })

  test('no muestra la línea de notas si la solicitud no tiene notas', () => {
    const solicitud = crearSolicitud('PENDIENTE')
    solicitud.notas = ''

    const wrapper = mount(SolicitudCard, {
      props: {
        solicitud: solicitud,
        nombreMostrado: 'Familia Serrano',
        mostrarAcciones: false,
      },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.text()).not.toContain('📝')
  })
})