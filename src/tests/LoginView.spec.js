import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

describe('LoginView', () => {
  test('muestra error si los campos están vacíos', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Por favor, rellena todos los campos.')
  })
})