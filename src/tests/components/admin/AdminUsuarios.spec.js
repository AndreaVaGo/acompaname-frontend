import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminUsuarios from '../../../components/admin/AdminUsuarios.vue'

const USUARIOS = [
  { id: 1, nombre: 'Ana', email: 'ana@test.com', telefono: '600', rol: 'FAMILIA', activo: true },
  { id: 2, nombre: 'Pepe', email: 'pepe@test.com', telefono: '611', rol: 'CUIDADOR', activo: true },
  { id: 3, nombre: 'Luis', email: 'luis@test.com', telefono: '622', rol: 'FAMILIA', activo: false },
  { id: 9, nombre: 'Admin', email: 'admin@test.com', telefono: '633', rol: 'ADMIN', activo: true },
]

function montar(idPropio) {
  return mount(AdminUsuarios, {
    props: { usuarios: USUARIOS, idPropio: idPropio },
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
})