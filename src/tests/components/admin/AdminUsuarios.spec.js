import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminUsuarios from '../../../components/admin/AdminUsuarios.vue'

const USUARIOS = [
  { id: 1, nombre: 'Ana', email: 'ana@test.com', telefono: '600', rol: 'FAMILIA', activo: true },
  { id: 2, nombre: 'Pepe', email: 'pepe@test.com', telefono: '611', rol: 'CUIDADOR', activo: true },
  { id: 3, nombre: 'Luis', email: 'luis@test.com', telefono: '622', rol: 'FAMILIA', activo: false },
  { id: 9, nombre: 'Admin', email: 'admin@test.com', telefono: '633', rol: 'ADMIN', activo: true },
]

function montar(idPropio, lista) {
  return mount(AdminUsuarios, {
    props: { usuarios: lista || USUARIOS, idPropio: idPropio },
  })
}

describe('AdminUsuarios', () => {
  test('muestra el nombre, el email y el rol de cada usuario', () => {
    const wrapper = montar(9)

    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('ana@test.com')
    expect(wrapper.text()).toContain('Familia')
    expect(wrapper.text()).toContain('Cuidador')
    expect(wrapper.text()).toContain('Administrador')
  })

  test('los usuarios activos dicen Activo y los bloqueados dicen Bloqueado', () => {
    const wrapper = montar(9)

    const filas = wrapper.findAll('tbody tr')

    expect(filas[0].text()).toContain('Activo')
    expect(filas[2].text()).toContain('Bloqueado')
    expect(filas[2].text()).not.toContain('Activo')
  })

  test('un usuario activo tiene el botón Bloquear y uno bloqueado, Desbloquear', () => {
    const wrapper = montar(9)

    const filas = wrapper.findAll('tbody tr')

    expect(filas[0].find('button').text()).toBe('Bloquear')
    expect(filas[2].find('button').text()).toBe('Desbloquear')
  })

  test('al pulsar el botón avisa con el usuario de esa fila', async () => {
    const wrapper = montar(9)

    await wrapper.findAll('tbody tr')[1].find('button').trigger('click')

    expect(wrapper.emitted('cambiarActivo').length).toBe(1)
    expect(wrapper.emitted('cambiarActivo')[0][0].id).toBe(2)
  })

  test('en la cuenta propia no hay botón y pone Tú', () => {
    const wrapper = montar(9)

    const filaAdmin = wrapper.findAll('tbody tr')[3]

    expect(filaAdmin.find('button').exists()).toBe(false)
    expect(filaAdmin.text()).toContain('Tú')
  })

  test('el id propio puede llegar como texto', () => {
    const wrapper = montar('9')

    const filaAdmin = wrapper.findAll('tbody tr')[3]

    expect(filaAdmin.find('button').exists()).toBe(false)
  })

  test('al principio enseña todos los usuarios y cuántos son', () => {
    const wrapper = montar(9)

    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    expect(wrapper.text()).toContain('4 usuarios')
  })

  test('el filtro Familias solo enseña a las familias', async () => {
    const wrapper = montar(9)

    await wrapper.find('select').setValue('FAMILIA')

    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('Luis')
    expect(wrapper.text()).not.toContain('Pepe')
    expect(wrapper.text()).toContain('2 usuarios')
  })

  test('el filtro Cuidadores solo enseña a los cuidadores y dice 1 usuario', async () => {
    const wrapper = montar(9)

    await wrapper.find('select').setValue('CUIDADOR')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('Pepe')
    expect(wrapper.text()).toContain('1 usuario')
    expect(wrapper.text()).not.toContain('1 usuarios')
  })

  test('el filtro Administradores solo enseña a los administradores', async () => {
    const wrapper = montar(9)

    await wrapper.find('select').setValue('ADMIN')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('admin@test.com')
  })

  test('al volver a Todos se ven otra vez todos los usuarios', async () => {
    const wrapper = montar(9)
    await wrapper.find('select').setValue('CUIDADOR')

    await wrapper.find('select').setValue('')

    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
  })

  test('el buscador encuentra por nombre sin mirar mayúsculas', async () => {
    const wrapper = montar(9)

    await wrapper.find('input[type="search"]').setValue('PEPE')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('pepe@test.com')
  })

  test('el buscador también encuentra por email', async () => {
    const wrapper = montar(9)

    await wrapper.find('input[type="search"]').setValue('luis@')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('Luis')
  })

  test('el filtro de rol y el buscador funcionan a la vez', async () => {
    const wrapper = montar(9)

    await wrapper.find('select').setValue('FAMILIA')
    await wrapper.find('input[type="search"]').setValue('ana')

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('ana@test.com')
    expect(wrapper.text()).not.toContain('Luis')
  })

  test('si nadie coincide con la búsqueda lo dice y no enseña la tabla', async () => {
    const wrapper = montar(9)

    await wrapper.find('input[type="search"]').setValue('zzz')

    expect(wrapper.text()).toContain('Ningún usuario coincide con la búsqueda.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  test('sin usuarios dice que no hay usuarios', () => {
    const wrapper = montar(9, [])

    expect(wrapper.text()).toContain('No hay usuarios.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  test('con el filtro puesto, el botón avisa con el usuario que se ve en esa fila', async () => {
    const wrapper = montar(9)
    await wrapper.find('select').setValue('CUIDADOR')

    await wrapper.find('tbody tr button').trigger('click')

    expect(wrapper.emitted('cambiarActivo')[0][0].id).toBe(2)
  })
})