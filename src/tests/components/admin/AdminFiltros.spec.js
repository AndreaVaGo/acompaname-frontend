import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminFiltros from '../../../components/admin/AdminFiltros.vue'

const OPCIONES = [
  { valor: '', nombre: 'Todos', color: 'neutro' },
  { valor: 'A', nombre: 'Uno', color: 'naranja' },
  { valor: 'B', nombre: 'Dos', color: 'verde' },
  { valor: 'C', nombre: 'Tres', color: 'azul' },
  { valor: 'D', nombre: 'Cuatro', color: 'gris' },
]

function montar(opciones, elegido) {
  return mount(AdminFiltros, {
    props: { opciones: opciones, elegido: elegido, etiqueta: 'Filtrar por algo' },
  })
}

function botonFiltro(wrapper, nombre) {
  return wrapper
    .findAll('.admin-filtros__boton')
    .find((boton) => boton.text().startsWith(nombre))
}

describe('AdminFiltros', () => {
  test('hay un botón por opción dentro de un grupo con su etiqueta', () => {
    const wrapper = montar(OPCIONES, '')

    const grupo = wrapper.find('[role="group"]')

    expect(grupo.attributes('aria-label')).toBe('Filtrar por algo')
    expect(wrapper.findAll('button').map((boton) => boton.text())).toEqual([
      'Todos',
      'Uno',
      'Dos',
      'Tres',
      'Cuatro',
    ])
  })

  test('cada botón lleva la clase de su color', () => {
    const wrapper = montar(OPCIONES, '')

    expect(botonFiltro(wrapper, 'Todos').classes()).toContain('admin-filtros__boton--neutro')
    expect(botonFiltro(wrapper, 'Uno').classes()).toContain('admin-filtros__boton--naranja')
    expect(botonFiltro(wrapper, 'Dos').classes()).toContain('admin-filtros__boton--verde')
    expect(botonFiltro(wrapper, 'Tres').classes()).toContain('admin-filtros__boton--azul')
    expect(botonFiltro(wrapper, 'Cuatro').classes()).toContain('admin-filtros__boton--gris')
  })

  test('solo el botón elegido está marcado', () => {
    const wrapper = montar(OPCIONES, 'B')

    expect(botonFiltro(wrapper, 'Dos').classes()).toContain('admin-filtros__boton--activo')
    expect(botonFiltro(wrapper, 'Dos').attributes('aria-pressed')).toBe('true')
    expect(botonFiltro(wrapper, 'Todos').classes()).not.toContain('admin-filtros__boton--activo')
    expect(botonFiltro(wrapper, 'Todos').attributes('aria-pressed')).toBe('false')
  })

  test('con el valor vacío queda marcado Todos', () => {
    const wrapper = montar(OPCIONES, '')

    expect(botonFiltro(wrapper, 'Todos').attributes('aria-pressed')).toBe('true')
    expect(botonFiltro(wrapper, 'Uno').attributes('aria-pressed')).toBe('false')
  })

  test('al pulsar un botón avisa con su valor', async () => {
    const wrapper = montar(OPCIONES, '')

    await botonFiltro(wrapper, 'Tres').trigger('click')
    await botonFiltro(wrapper, 'Todos').trigger('click')

    expect(wrapper.emitted('elegir')).toEqual([['C'], ['']])
  })

  test('enseña el contador solo si la opción lo trae, también cuando es cero', () => {
    const conCuenta = [
      { valor: '', nombre: 'Todos', color: 'neutro', cuenta: 4 },
      { valor: 'A', nombre: 'Uno', color: 'naranja', cuenta: 0 },
    ]
    const wrapper = montar(conCuenta, '')

    expect(wrapper.findAll('.admin-filtros__cuenta').map((c) => c.text())).toEqual(['4', '0'])
    expect(montar(OPCIONES, '').find('.admin-filtros__cuenta').exists()).toBe(false)
  })
})
