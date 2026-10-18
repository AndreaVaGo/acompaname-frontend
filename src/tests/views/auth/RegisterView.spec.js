import { describe, test, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../../../views/auth/RegisterView.vue'
import AuthRepository from '../../../repositories/AuthRepository'
import RoleRepository from '../../../repositories/RoleRepository'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

const roles = [
  { id: 4, name: 'FAMILIA' },
  { id: 5, name: 'CUIDADOR' },
]

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

async function montarVista() {
  vi.spyOn(RoleRepository.prototype, 'getAll').mockResolvedValue(roles)
  const wrapper = mount(RegisterView, {
    global: {
      plugins: [router],
    },
  })
  await esperar()
  return wrapper
}

async function rellenarFormulario(wrapper) {
  await wrapper.find('#nombre').setValue('Ana López')
  await wrapper.find('#email').setValue('ana@test.com')
  await wrapper.find('#password').setValue('12345678')
  await wrapper.find('#telefono').setValue('600111222')
}

describe('RegisterView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra error si los campos están vacíos', async () => {
    const wrapper = await montarVista()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.register__error').exists()).toBe(true)
  })

  test('registra a una familia con el id de su rol y va al login', async () => {
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.findAll('button[type="button"]')[0].trigger('click')
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(registrar).toHaveBeenCalledWith({
      nombre: 'Ana López',
      email: 'ana@test.com',
      telefono: '600111222',
      password: '12345678',
      rolesIds: [4],
    })
    expect(push).toHaveBeenCalledWith('/login')
  })

  test('al elegir cuidador se registra con el id del rol cuidador', async () => {
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.findAll('button[type="button"]')[1].trigger('click')
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(registrar).toHaveBeenCalledTimes(1)
    expect(registrar.mock.calls[0][0].rolesIds).toEqual([5])
  })

  test('si el registro falla, muestra el error y no cambia de página', async () => {
    vi.spyOn(AuthRepository.prototype, 'register').mockRejectedValue(
      new Error('fallo')
    )
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(wrapper.text()).toContain(
      'No se pudo completar el registro. Revisa los datos.'
    )
    expect(push).not.toHaveBeenCalled()
  })

  test('si la dirección trae rol=cuidador, el rol cuidador ya viene marcado', async () => {
    await router.push('/registro?rol=cuidador')
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(registrar.mock.calls[0][0].rolesIds).toEqual([5])
    expect(
      wrapper.findAll('button[type="button"]')[1].classes()
    ).toContain('register__role--active')
  })
})