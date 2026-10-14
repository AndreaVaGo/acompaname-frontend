import { describe, test, expect, vi } from 'vitest'
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

// Tarjeta tal y como la ve el cuidador (con acciones)
function montarTarjetaCuidador(estado, completar) {
  return mount(SolicitudCard, {
    props: {
      solicitud: crearSolicitud(estado),
      nombreMostrado: 'Familia Serrano',
      mostrarAcciones: true,
      completar: completar,
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

  test('muestra la fecha de fin si la solicitud la tiene', () => {
    const wrapper = mount(SolicitudCard, {
      props: {
        solicitud: { ...crearSolicitud('PENDIENTE'), fechaFin: '2026-08-19' },
        nombreMostrado: 'Familia Serrano',
        mostrarAcciones: false,
      },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.text()).toContain('Inicio: 2026-08-12')
    expect(wrapper.text()).toContain('Fin: 2026-08-19')
  })

  test('no muestra la línea de fin si la solicitud no tiene fecha de fin', () => {
    const wrapper = montarTarjeta('PENDIENTE', false)

    expect(wrapper.text()).not.toContain('Fin:')
  })

  test('muestra las necesidades del paciente con su nombre', () => {
    const wrapper = mount(SolicitudCard, {
      props: {
        solicitud: {
          ...crearSolicitud('PENDIENTE'),
          necesidades: ['movilidad', 'nocturno'],
        },
        nombreMostrado: 'Familia Serrano',
        mostrarAcciones: false,
      },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    const etiquetas = wrapper.findAll('.solicitudes__necesidad')
    expect(etiquetas.length).toBe(2)
    expect(etiquetas[0].text()).toBe('Movilidad reducida')
    expect(etiquetas[1].text()).toBe('Acompañamiento nocturno')
  })

  test('no muestra el bloque de necesidades si no hay ninguna', () => {
    const wrapper = mount(SolicitudCard, {
      props: {
        solicitud: { ...crearSolicitud('PENDIENTE'), necesidades: [] },
        nombreMostrado: 'Familia Serrano',
        mostrarAcciones: false,
      },
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    })

    expect(wrapper.find('.solicitudes__necesidades').exists()).toBe(false)
  })

  test('una solicitud antigua sin necesidades se muestra sin errores', () => {
    const wrapper = montarTarjeta('PENDIENTE', false)

    expect(wrapper.find('.solicitudes__necesidades').exists()).toBe(false)
    expect(wrapper.text()).toContain('Antonio Serrano')
  })

  test('el cuidador ve el botón Marcar como completada si la solicitud está aceptada', () => {
    const wrapper = montarTarjetaCuidador('ACEPTADA', vi.fn())

    expect(wrapper.text()).toContain('Marcar como completada')
  })

  test('el cuidador no ve el botón Marcar como completada si la solicitud está pendiente', () => {
    const wrapper = montarTarjetaCuidador('PENDIENTE', vi.fn())

    expect(wrapper.text()).not.toContain('Marcar como completada')
  })

  test('la familia no ve el botón Marcar como completada', () => {
    const wrapper = montarTarjeta('ACEPTADA', false)

    expect(wrapper.text()).not.toContain('Marcar como completada')
  })

  test('al pulsar Marcar como completada se llama a completar con el id', async () => {
    const completar = vi.fn()
    const wrapper = montarTarjetaCuidador('ACEPTADA', completar)

    await wrapper.find('.solicitudes__completar').trigger('click')

    expect(completar).toHaveBeenCalledWith(1)
  })
})