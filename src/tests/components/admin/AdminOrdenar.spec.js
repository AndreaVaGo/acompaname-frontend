import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminOrdenar from '../../../components/admin/AdminOrdenar.vue'

const COLUMNAS = [
  { clave: 'nombre', nombre: 'Nombre' },
  { clave: 'fecha', nombre: 'Fecha' },
]

function montar(orden) {
  return mount(AdminOrdenar, { props: { columnas: COLUMNAS, orden: orden } })
}

describe('AdminOrdenar', () => {
  test('el desplegable tiene Sin ordenar y una opción por columna', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    const textos = wrapper.findAll('option').map((opcion) => opcion.text())

    expect(textos).toEqual(['Sin ordenar', 'Nombre', 'Fecha'])
  })

  test('al elegir una columna avisa con su clave', async () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    await wrapper.find('select').setValue('fecha')

    expect(wrapper.emitted('ordenar')[0]).toEqual(['fecha'])
  })

  test('sin orden elegido no hay botón de sentido', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    expect(wrapper.find('.admin-ordenar__sentido').exists()).toBe(false)
  })

  test('con orden elegido el botón dice el sentido y al pulsarlo repite la clave', async () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'desc' })

    const boton = wrapper.find('.admin-ordenar__sentido')
    await boton.trigger('click')

    expect(boton.text()).toContain('De mayor a menor')
    expect(wrapper.emitted('ordenar')[0]).toEqual(['nombre'])
  })
})
