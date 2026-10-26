import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminMenu from '../../../components/admin/AdminMenu.vue'

const SECCIONES = [
  { id: 'resumen', texto: 'Resumen' },
  { id: 'solicitudes', texto: 'Solicitudes' },
  { id: 'usuarios', texto: 'Usuarios' },
]

function montarMenu(activa = 'resumen') {
  return mount(AdminMenu, { props: { secciones: SECCIONES, activa } })
}

describe('AdminMenu', () => {
  test('muestra un botón por cada sección', () => {
    const wrapper = montarMenu()

    const textos = wrapper.findAll('button').map((boton) => boton.text())

    expect(textos).toEqual(['Resumen', 'Solicitudes', 'Usuarios'])
  })

  test('marca como actual solo la sección activa', () => {
    const wrapper = montarMenu('usuarios')

    const botones = wrapper.findAll('button')

    expect(botones[0].attributes('aria-current')).toBeUndefined()
    expect(botones[1].attributes('aria-current')).toBeUndefined()
    expect(botones[2].attributes('aria-current')).toBe('page')
    expect(botones[2].classes()).toContain('admin-menu__boton--activo')
  })

  test('al pulsar una sección avisa con su id', async () => {
    const wrapper = montarMenu()

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('cambiar')).toEqual([['solicitudes']])
  })

  test('el menú tiene una etiqueta accesible', () => {
    const wrapper = montarMenu()

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Secciones del panel')
  })
})