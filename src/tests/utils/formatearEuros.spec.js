import { describe, test, expect } from 'vitest'
import { formatearEuros } from '../../utils/formatearEuros'

describe('formatearEuros', () => {
  test('un importe sin decimales lleva dos decimales y el símbolo del euro', () => {
    expect(formatearEuros(340)).toBe('340,00 €')
  })

  test('un importe con un decimal se completa con un cero', () => {
    expect(formatearEuros(340.5)).toBe('340,50 €')
  })

  test('los miles se separan con un punto', () => {
    expect(formatearEuros(1260)).toBe('1.260,00 €')
  })

  test('varios grupos de miles también se separan', () => {
    expect(formatearEuros(1234567.891)).toBe('1.234.567,89 €')
  })

  test('sin importe se enseña cero', () => {
    expect(formatearEuros(null)).toBe('0,00 €')
    expect(formatearEuros(undefined)).toBe('0,00 €')
    expect(formatearEuros(0)).toBe('0,00 €')
  })
})