import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'

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