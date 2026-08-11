import { describe, test, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import SolicitudCard from '../components/SolicitudCard.vue'

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
})