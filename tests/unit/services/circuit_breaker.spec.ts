import { test } from '@japa/runner'
import { CircuitBreaker } from '#application/services/circuit_breaker'

test.group('CircuitBreaker', () => {
  test('starts in CLOSED state', ({ assert }) => {
    const cb = new CircuitBreaker()
    assert.equal(cb.getState(), 'CLOSED')
  })

  test('executes fn and returns result when CLOSED', async ({ assert }) => {
    const cb = new CircuitBreaker()
    const result = await cb.execute(async () => 42)
    assert.equal(result, 42)
    assert.equal(cb.getState(), 'CLOSED')
  })

  test('opens after failureThreshold failures', async ({ assert }) => {
    const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 100 })
    await assert.rejects(() => cb.execute(async () => { throw new Error('fail') }))
    await assert.rejects(() => cb.execute(async () => { throw new Error('fail') }))
    assert.equal(cb.getState(), 'OPEN')
    await assert.rejects(() => cb.execute(async () => 1), 'CircuitBreaker is OPEN')
  })

  test('half-open allows one call after resetTimeout', async ({ assert }) => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 50 })
    await assert.rejects(() => cb.execute(async () => { throw new Error('fail') }))
    assert.equal(cb.getState(), 'OPEN')
    await new Promise((r) => setTimeout(r, 60))
    assert.equal(cb.getState(), 'HALF_OPEN')
    const result = await cb.execute(async () => 1)
    assert.equal(result, 1)
    assert.equal(cb.getState(), 'CLOSED')
  })
})
