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

  test('la ventana de detalles lista a cada persona con su edad', async () => {
    const wrapper = montarTarjeta(
      crearSolicitud({
        personas: [
          { nombre: 'Maria', edad: 83 },
          { nombre: 'Olga', edad: 80 },
          { nombre: 'Ricardo', edad: 83 },
        ],
      }),
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    const items = wrapper.find('.solicitudes__modal').findAll('.solicitudes__lista-personas li')
    expect(items).toHaveLength(3)
    expect(items[1].text()).toContain('Olga')
    expect(items[1].text()).toContain('80 años')
    expect(wrapper.find('.solicitudes__modal').text()).toContain('Personas a cuidar')
  })

  test('la ventana de detalles dice Persona a cuidar en singular si es una', async () => {
    const wrapper = montarTarjeta(
      crearSolicitud({ personas: [{ nombre: 'Lucía', edad: 2 }] }),
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    const texto = wrapper.find('.solicitudes__modal').text()
    expect(texto).toContain('Persona a cuidar')
    expect(texto).not.toContain('Personas a cuidar')
  })

  test('la ventana de detalles repite el tipo, el grupo y las fechas', async () => {
    const wrapper = montarTarjeta(
      crearSolicitud({
        grupoEdad: 'MAYORES',
        horaInicio: '09:00',
        personas: [{ nombre: 'Carmen', edad: 82 }],
      }),
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    const texto = wrapper.find('.solicitudes__modal').text()
    expect(texto).toContain('domicilio')
    expect(texto).toContain('Personas mayores')
    expect(texto).toContain('Inicio')
  })

  test('la familia no tiene ventana de detalles', () => {
    const wrapper = montarTarjeta(crearSolicitud({ personas: matrimonio }), false)

    expect(wrapper.find('.solicitudes__modal').exists()).toBe(false)
    expect(wrapper.find('.solicitudes__lista-personas').exists()).toBe(false)
  })

  const mixta = [
    { nombre: 'Zoe', edad: 5, grupoEdad: 'NINOS' },
    { nombre: 'Abuelo', edad: 80, grupoEdad: 'MAYORES' },
  ]

  test('con grupos distintos la tarjeta dice Grupos de edad y los nombra todos', () => {
    const wrapper = montarTarjeta(crearSolicitud({ grupoEdad: 'NINOS', personas: mixta }), false)

    expect(wrapper.text()).toContain('Grupos de edad:')
    expect(wrapper.text()).toContain('Niñas y niños, Personas mayores')
  })

  test('con un solo grupo la tarjeta dice Grupo de edad en singular', () => {
    const wrapper = montarTarjeta(
      crearSolicitud({
        grupoEdad: 'NINOS',
        personas: [{ nombre: 'Zoe', edad: 5, grupoEdad: 'NINOS' }],
      }),
      false,
    )

    expect(wrapper.text()).toContain('Grupo de edad:')
    expect(wrapper.text()).not.toContain('Grupos de edad:')
  })

  test('la ventana de detalles enseña el grupo de cada persona si hay varios grupos', async () => {
    const wrapper = montarTarjeta(crearSolicitud({ grupoEdad: 'NINOS', personas: mixta }), true)

    await wrapper.find('.solicitudes__ver').trigger('click')

    const items = wrapper.find('.solicitudes__modal').findAll('.solicitudes__lista-personas li')
    expect(items[0].text()).toContain('Niñas y niños')
    expect(items[1].text()).toContain('Personas mayores')
  })

  test('la ventana de detalles no repite el grupo en cada persona si todos son iguales', async () => {
    const wrapper = montarTarjeta(
      crearSolicitud({
        grupoEdad: 'NINOS',
        personas: [
          { nombre: 'Zoe', edad: 5, grupoEdad: 'NINOS' },
          { nombre: 'Ada', edad: 9, grupoEdad: 'NINOS' },
        ],
      }),
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    expect(wrapper.find('.solicitudes__grupo-persona').exists()).toBe(false)
  })
})

describe('SolicitudCard: ventana de detalles', () => {
  test('el nombre de la persona a cuidar sale solo en su recuadro, no debajo de la cabecera', async () => {
    const wrapper = montarTarjeta(
      crearSolicitud({ personas: [{ nombre: 'Antonio', edad: 85 }] }),
      true,
    )

    await wrapper.find('.solicitudes__ver').trigger('click')

    const modal = wrapper.find('.solicitudes__modal')
    expect(modal.find('.solicitudes__modal-top h3').text()).toBe('Familia Serrano')
    expect(modal.find('.solicitudes__modal-top .solicitudes__paciente').exists()).toBe(false)
    expect(modal.find('.solicitudes__lista-personas').text()).toContain('Antonio')
  })
})
