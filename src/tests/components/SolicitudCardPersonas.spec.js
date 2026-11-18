import { describe, test, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SolicitudCard from '../../components/SolicitudCard.vue'

function crearSolicitud(extra) {
  return {
    id: 1,
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

const matrimonio = [
  { nombre: 'Carmen', edad: 82 },
  { nombre: 'Antonio', edad: 85 },
]

describe('SolicitudCard: varias personas', () => {
  test('con varias personas enseña los nombres y cuántas son', () => {
    const wrapper = montarTarjeta(crearSolicitud({ personas: matrimonio }), true)

    expect(wrapper.text()).toContain('Carmen y Antonio')
    expect(wrapper.find('.solicitudes__personas').text()).toContain('2 personas')
    expect(wrapper.find('.solicitudes__personas').text()).toContain(
      'Carmen (82), Antonio (85)',
    )
  })

  test('la familia también ve todas las personas', () => {
    const wrapper = montarTarjeta(crearSolicitud({ personas: matrimonio }), false)

    expect(wrapper.find('.solicitudes__personas').exists()).toBe(true)
  })

  test('con una sola persona no enseña la línea de personas', () => {
    const wrapper = montarTarjeta(
      crearSolicitud({ personas: [{ nombre: 'Lucía', edad: 2 }] }),
      true,
    )

    expect(wrapper.text()).toContain('Lucía')
    expect(wrapper.find('.solicitudes__personas').exists()).toBe(false)
  })

  test('una solicitud antigua sin lista enseña el nombre de siempre', () => {
    const wrapper = montarTarjeta(
      crearSolicitud({ nombrePaciente: 'Manuel', edadPaciente: 80 }),
      true,
    )

    expect(wrapper.text()).toContain('Manuel')
    expect(wrapper.find('.solicitudes__personas').exists()).toBe(false)
  })
})
