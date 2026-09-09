import { describe, test, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import RoleRepository from '../repositories/RoleRepository'

vi.spyOn(RoleRepository.prototype, 'getAll').mockResolvedValue([
  { id: 4, name: 'FAMILIA' },
  { id: 5, name: 'CUIDADOR' },
])

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

describe('RegisterView', () => {
  test('muestra error si los campos están vacíos', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Por favor, rellena todos los campos.')
  })
})