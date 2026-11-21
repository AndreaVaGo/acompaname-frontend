import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagosTabla from '../../../components/admin/AdminPagosTabla.vue'

const PAGOS = [
  {
    id: 1,
    solicitudId: 11,
    nombreFamilia: 'Ana',
    nombreCuidador: 'Pepe',
    tipoCuidado: 'hospitalario',
    importe: 36,
    estado: 'PENDIENTE',
    fecha: '2026-10-10',
    diasDesdeCreacion: 10,
  },
  {
    id: 2,
    solicitudId: 12,
    nombreFamilia: 'Luis',
    nombreCuidador: 'Marta',
    tipoCuidado: 'domicilio',
    importe: 18,
    estado: 'PENDIENTE',
    fecha: '2026-10-20',
    diasDesdeCreacion: 1,
  },
  {
    id: 3,
    solicitudId: 13,
    nombreFamilia: 'Carmen',
    nombreCuidador: 'Pepe',
    tipoCuidado: 'domicilio',
    importe: 20,
    estado: 'COMPLETADO',
    fecha: '2026-10-05',
    diasDesdeCreacion: 15,
  },
  {
    id: 4,
    solicitudId: 14,
    nombreFamilia: 'Ana',
    nombreCuidador: 'Marta',
    tipoCuidado: 'domicilio',
    importe: 10,
    estado: 'CANCELADO',
    fecha: '2026-10-01',
    diasDesdeCreacion: 19,
  },
]

function montar(pagos, estado) {
  return mount(AdminPagosTabla, { props: { pagos: pagos, estado: estado } })
}

// El botón del filtro con ese nombre (Todos, Pendiente, Cobrado, Cancelado)
function botonFiltro(wrapper, nombre) {
  return wrapper
    .findAll('.admin-filtros__boton')
    .find((boton) => boton.text() === nombre)
}

describe('AdminPagosTabla', () => {
  test('muestra la familia, el cuidador, el tipo, el importe, la fecha y el estado', () => {
    const wrapper = montar(PAGOS, '')

    const filas = wrapper.findAll('tbody tr')

    expect(filas.length).toBe(4)
    expect(filas[0].text()).toContain('Ana')
    expect(filas[0].text()).toContain('Pepe')
    expect(filas[0].text()).toContain('Hospitalario')
    expect(filas[0].text()).toContain('36,00 €')
    expect(filas[0].text()).toContain('10-10-2026')
    expect(filas[0].text()).toContain('Pendiente')
  })

  test('el estado completado se enseña como Cobrado', () => {
    const wrapper = montar(PAGOS, '')

    expect(wrapper.findAll('tbody tr')[2].text()).toContain('Cobrado')
    expect(wrapper.findAll('tbody tr')[3].text()).toContain('Cancelado')
  })

  test('cada tipo de cuidado lleva su clase de color', () => {
    const wrapper = montar(PAGOS, '')

    const tipos = wrapper.findAll('tbody tr').map((fila) => fila.findAll('.admin-pildora')[0])

    expect(tipos[0].classes()).toContain('admin-pildora--azul')
    expect(tipos[1].classes()).toContain('admin-pildora--verde')
  })

  test('los días sin cobrar solo salen en los pendientes y en singular si es uno', () => {
    const wrapper = montar(PAGOS, '')

    const filas = wrapper.findAll('tbody tr')

    expect(filas[0].find('td[data-label="Sin cobrar"]').text()).toBe('10 días')
    expect(filas[1].find('td[data-label="Sin cobrar"]').text()).toBe('1 día')
    expect(filas[2].find('td[data-label="Sin cobrar"]').text()).toBe('—')
  })

  test('marca como retrasado el pendiente de más de siete días', () => {
    const wrapper = montar(PAGOS, '')

    const filas = wrapper.findAll('tbody tr')

    expect(filas[0].find('td[data-label="Sin cobrar"]').classes()).toContain(
      'admin-pagos-tabla__retrasado'
    )
    expect(filas[1].find('td[data-label="Sin cobrar"]').classes()).not.toContain(
      'admin-pagos-tabla__retrasado'
    )
  })

  test('al pulsar un botón del filtro avisa con el estado elegido', async () => {
    const wrapper = montar(PAGOS, '')

    await botonFiltro(wrapper, 'Cobrado').trigger('click')

    expect(wrapper.emitted('cambiarEstado')).toEqual([['COMPLETADO']])
  })

  test('pulsar Todos avisa con el texto vacío', async () => {
    const wrapper = montar(PAGOS, 'CANCELADO')

    await botonFiltro(wrapper, 'Todos').trigger('click')

    expect(wrapper.emitted('cambiarEstado')).toEqual([['']])
  })

  test('el filtro marca el estado que le llega y cada botón lleva su color', () => {
    const wrapper = montar(PAGOS, 'CANCELADO')

    const botones = wrapper.findAll('.admin-filtros__boton')

    expect(botones.map((boton) => boton.text())).toEqual([
      'Todos',
      'Pendiente',
      'Cobrado',
      'Cancelado',
    ])
    expect(botonFiltro(wrapper, 'Cancelado').classes()).toContain('admin-filtros__boton--activo')
    expect(botonFiltro(wrapper, 'Cancelado').attributes('aria-pressed')).toBe('true')
    expect(botonFiltro(wrapper, 'Todos').attributes('aria-pressed')).toBe('false')
    expect(botonFiltro(wrapper, 'Pendiente').classes()).toContain('admin-filtros__boton--naranja')
    expect(botonFiltro(wrapper, 'Cobrado').classes()).toContain('admin-filtros__boton--verde')
  })

  test('el buscador filtra por el nombre de la familia sin mirar mayúsculas', async () => {
    const wrapper = montar(PAGOS, '')

    await wrapper.find('input[type="search"]').setValue('CARM')

    const filas = wrapper.findAll('tbody tr')
    expect(filas.length).toBe(1)
    expect(filas[0].text()).toContain('Carmen')
  })

  test('el buscador también filtra por el nombre del cuidador', async () => {
    const wrapper = montar(PAGOS, '')

    await wrapper.find('input[type="search"]').setValue('marta')

    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  test('si nada coincide con la búsqueda lo dice', async () => {
    const wrapper = montar(PAGOS, '')

    await wrapper.find('input[type="search"]').setValue('zzz')

    expect(wrapper.text()).toContain('Ningún pago coincide con la búsqueda.')
    expect(wrapper.find('tbody').exists()).toBe(false)
  })

  test('el pie cuenta los pagos mostrados y suma su importe', async () => {
    const wrapper = montar(PAGOS, '')

    expect(wrapper.find('.admin-pagos-tabla__pie').text()).toBe('4 pagos · Total 84,00 €')

    await wrapper.find('input[type="search"]').setValue('carmen')

    expect(wrapper.find('.admin-pagos-tabla__pie').text()).toBe('1 pago · Total 20,00 €')
  })

  test('sin pagos muestra el mensaje de vacío y mantiene los botones', () => {
    const wrapper = montar([], 'CANCELADO')

    expect(wrapper.text()).toContain('No hay pagos con este estado.')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.findAll('.admin-filtros__boton').length).toBe(4)
  })

  test('la tabla va dentro del contenedor con los estilos compartidos', () => {
    const wrapper = montar(PAGOS, '')

    expect(wrapper.find('.admin-tabla table').exists()).toBe(true)
  })
})

// Pulsa una flecha de la cabecera de una columna: direccion es 'asc' (▲) o 'desc' (▼)
function pulsarFlecha(wrapper, nombre, direccion) {
  const cabecera = wrapper
    .findAll('th')
    .find((th) => th.find('.admin-cabecera-orden__texto').text() === nombre)
  return cabecera.find(`button[data-direccion="${direccion}"]`).trigger('click')
}

function importes(wrapper) {
  return wrapper.findAll('tbody tr').map((fila) => fila.find('td[data-label="Familia"]').text())
}

describe('AdminPagosTabla · ordenar', () => {
  test('al ordenar por Importe va de menor a mayor como número (10, 18, 20, 36)', async () => {
    const wrapper = montar(PAGOS, '')

    await pulsarFlecha(wrapper, 'Importe', 'asc')

    // 10 es Ana (id 4), 18 Luis, 20 Carmen y 36 Ana (id 1)
    expect(importes(wrapper)).toEqual(['Ana', 'Luis', 'Carmen', 'Ana'])
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('10')
  })

  test('al ordenar por Familia sale Ana, Ana, Carmen, Luis', async () => {
    const wrapper = montar(PAGOS, '')

    await pulsarFlecha(wrapper, 'Familia', 'asc')

    expect(importes(wrapper)).toEqual(['Ana', 'Ana', 'Carmen', 'Luis'])
  })

  test('al ordenar por Sin cobrar los que no tienen días quedan siempre al final', async () => {
    const wrapper = montar(PAGOS, '')

    await pulsarFlecha(wrapper, 'Sin cobrar', 'asc')
    expect(importes(wrapper).slice(0, 2)).toEqual(['Luis', 'Ana'])

    await pulsarFlecha(wrapper, 'Sin cobrar', 'desc')
    expect(importes(wrapper).slice(0, 2)).toEqual(['Ana', 'Luis'])
    expect(wrapper.findAll('tbody tr')[3].text()).toContain('—')
  })

  test('el total no cambia al ordenar', async () => {
    const wrapper = montar(PAGOS, '')
    const antes = wrapper.find('.admin-pagos-tabla__pie').text()

    await pulsarFlecha(wrapper, 'Importe', 'asc')

    expect(wrapper.find('.admin-pagos-tabla__pie').text()).toBe(antes)
  })
})
