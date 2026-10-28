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

// Contraseña que cumple todas las reglas (mayúscula, minúscula, número y carácter especial)
const PASSWORD_VALIDA = 'Segura123!'

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
  await wrapper.find('#password').setValue(PASSWORD_VALIDA)
  await wrapper.find('#password-repetida').setValue(PASSWORD_VALIDA)
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
      password: PASSWORD_VALIDA,
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

    expect(wrapper.text()).toContain('No se pudo completar el registro.')
    expect(push).not.toHaveBeenCalled()
  })

  test('si el email ya está registrado, muestra el motivo que da el servidor', async () => {
    const errorEmail = new Error('fallo')
    errorEmail.status = 409
    errorEmail.detalle = 'Ya existe un usuario con ese email'
    vi.spyOn(AuthRepository.prototype, 'register').mockRejectedValue(errorEmail)
    const push = vi.spyOn(router, 'push').mockResolvedValue()
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(wrapper.text()).toContain(
      'No se pudo completar el registro. Ya existe un usuario con ese email.'
    )
    expect(push).not.toHaveBeenCalled()
  })

  test('si el servidor rechaza los datos, avisa de que no son correctos', async () => {
    const errorDatos = new Error('fallo')
    errorDatos.status = 400
    vi.spyOn(AuthRepository.prototype, 'register').mockRejectedValue(errorDatos)
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(wrapper.text()).toContain(
      'No se pudo completar el registro. Los datos enviados no son correctos.'
    )
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

  test('si la contraseña es débil, dice qué le falta y no registra', async () => {
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('#password').setValue('abcdefgh')
    await wrapper.find('#password-repetida').setValue('abcdefgh')
    await wrapper.find('form').trigger('submit')
    await esperar()

    const error = wrapper.find('.register__error').text()
    expect(error).toContain('una letra mayúscula')
    expect(error).toContain('un número')
    expect(error).toContain('un carácter especial')
    expect(registrar).not.toHaveBeenCalled()
  })

  test('si las contraseñas no coinciden, avisa y no registra', async () => {
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('#password-repetida').setValue('Otra123!x')
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(wrapper.find('.register__error').text()).toBe(
      'Las contraseñas no coinciden.'
    )
    expect(registrar).not.toHaveBeenCalled()
  })

  test('si falta repetir la contraseña, pide rellenar todos los campos', async () => {
    const registrar = vi
      .spyOn(AuthRepository.prototype, 'register')
      .mockResolvedValue({})
    const wrapper = await montarVista()

    await rellenarFormulario(wrapper)
    await wrapper.find('#password-repetida').setValue('')
    await wrapper.find('form').trigger('submit')
    await esperar()

    expect(wrapper.find('.register__error').text()).toBe(
      'Por favor, rellena todos los campos.'
    )
    expect(registrar).not.toHaveBeenCalled()
  })
})