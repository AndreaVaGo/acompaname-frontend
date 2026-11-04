import { describe, test, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function crearSolicitud(extra) {
  return {
    id: 1,
    nombrePaciente: 'Lucía',
    tipoCuidado: 'domicilio',
    fechaCuidado: '2026-08-12',
    estado: 'PENDIENTE',
    ...extra,
  }
}

function montarTarjeta(solicitud, mostrarAcciones) {
  return mount(SolicitudCard, {
    props: {
      solicitud: solicitud,
      nombreMostrado: 'Familia Serrano',
      mostrarAcciones: mostrarAcciones,
    },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('SolicitudCard: grupo de edad', () => {
  test('la familia ve el grupo de edad en la tarjeta', () => {
    const wrapper = montarTarjeta(crearSolicitud({ grupoEdad: 'BEBES' }), false)

    expect(wrapper.text()).toContain('Grupo de edad')
    expect(wrapper.text()).toContain('Bebés')
  })

  test('la persona cuidadora lo ve sin abrir los detalles', () => {
    const wrapper = montarTarjeta(
      crearSolicitud({ grupoEdad: 'MAYORES' }),
      true,
    )

    expect(wrapper.text()).toContain('Grupo de edad')
    expect(wrapper.text()).toContain('Personas mayores')
  })

  test('no muestra la línea si la solicitud no tiene grupo de edad', () => {
    const wrapper = montarTarjeta(crearSolicitud({}), false)

    expect(wrapper.text()).not.toContain('Grupo de edad')
    expect(wrapper.find('.solicitudes__grupo').exists()).toBe(false)
  })
})