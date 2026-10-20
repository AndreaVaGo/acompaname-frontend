import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminValoraciones from '../../../components/admin/AdminValoraciones.vue'

const VALORACIONES = [
  {
    id: 1,
    puntuacion: 5,
    comentario: 'Muy atenta con mi madre.',
    fecha: '2026-11-10',
    nombreFamilia: 'Ana',
    nombreCuidador: 'Pepe',
  },
  {
    id: 2,
    puntuacion: 2,
    comentario: null,
    fecha: '2026-11-09',
    nombreFamilia: 'Luis',
    nombreCuidador: 'Marta',
  },
]

function montar(valoraciones) {
  return mount(AdminValoraciones, {
    props: { valoraciones: valoraciones },
  })
}

describe('AdminValoraciones', () => {
  test('muestra el comentario, la nota, quién valora a quién y la fecha', () => {
    const wrapper = montar(VALORACIONES)

    expect(wrapper.text()).toContain('Últimas valoraciones')
    expect(wrapper.text()).toContain('Muy atenta con mi madre.')
    expect(wrapper.text()).toContain('5 / 5')
    expect(wrapper.text()).toContain('Ana sobre')
    expect(wrapper.text()).toContain('Pepe')
    expect(wrapper.text()).toContain('10-11-2026')
  })

  test('una valoración sin comentario dice Sin comentario', () => {
    const wrapper = montar(VALORACIONES)

    expect(wrapper.text()).toContain('Sin comentario')
  })

  test('sin valoraciones lo dice', () => {
    const wrapper = montar([])

    expect(wrapper.text()).toContain('Todavía no hay valoraciones.')
  })

  test('Eliminar no borra: primero pide confirmación', async () => {
    const wrapper = montar(VALORACIONES)

    await wrapper.find('.admin-valoraciones__eliminar').trigger('click')

    expect(wrapper.text()).toContain('¿Eliminar esta valoración?')
    expect(wrapper.emitted('eliminar')).toBeUndefined()
  })

  test('al confirmar avisa con el id de la valoración', async () => {
    const wrapper = montar(VALORACIONES)

    await wrapper.find('.admin-valoraciones__eliminar').trigger('click')
    await wrapper.find('.admin-valoraciones__si').trigger('click')

    expect(wrapper.emitted('eliminar').length).toBe(1)
    expect(wrapper.emitted('eliminar')[0]).toEqual([1])
    expect(wrapper.text()).not.toContain('¿Eliminar esta valoración?')
  })

  test('al cancelar no se avisa de nada y vuelve el botón Eliminar', async () => {
    const wrapper = montar(VALORACIONES)

    await wrapper.find('.admin-valoraciones__eliminar').trigger('click')
    const botones = wrapper.findAll('button')
    const cancelar = botones.find((boton) => boton.text() === 'Cancelar')
    await cancelar.trigger('click')

    expect(wrapper.emitted('eliminar')).toBeUndefined()
    expect(wrapper.text()).not.toContain('¿Eliminar esta valoración?')
    expect(wrapper.findAll('.admin-valoraciones__eliminar').length).toBe(2)
  })
})