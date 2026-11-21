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

  test('al elegir una columna avisa con su clave y mantiene el sentido actual', async () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'desc' })

    await wrapper.find('select').setValue('fecha')

    expect(wrapper.emitted('ordenar')[0]).toEqual([{ clave: 'fecha', direccion: 'desc' }])
  })

  test('sin orden elegido no hay botones de sentido', () => {
    const wrapper = montar({ clave: '', direccion: 'asc' })

    expect(wrapper.find('.admin-ordenar__sentidos').exists()).toBe(false)
  })

  test('con orden elegido se ven los dos sentidos', () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'asc' })

    const textos = wrapper.findAll('.admin-ordenar__sentido').map((boton) => boton.text())

    expect(textos).toEqual(['▲ De menor a mayor', '▼ De mayor a menor'])
  })

  test('el sentido que está en uso aparece encendido', () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'desc' })

    const desc = wrapper.find('button[data-direccion="desc"]')
    const asc = wrapper.find('button[data-direccion="asc"]')

    expect(desc.classes()).toContain('admin-ordenar__sentido--activo')
    expect(desc.attributes('aria-pressed')).toBe('true')
    expect(asc.classes()).not.toContain('admin-ordenar__sentido--activo')
  })

  test('cada botón de sentido avisa con su dirección en un solo clic', async () => {
    const wrapper = montar({ clave: 'nombre', direccion: 'asc' })

    await wrapper.find('button[data-direccion="desc"]').trigger('click')
    await wrapper.find('button[data-direccion="asc"]').trigger('click')

    expect(wrapper.emitted('ordenar')[0]).toEqual([{ clave: 'nombre', direccion: 'desc' }])
    expect(wrapper.emitted('ordenar')[1]).toEqual([{ clave: 'nombre', direccion: 'asc' }])
  })
})
