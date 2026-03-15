export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeoutMs: number
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeoutMs: 30_000,
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failures = 0
  private lastFailureAt: number | null = null
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  getState(): CircuitState {
    if (this.state === 'OPEN' && this.lastFailureAt !== null) {
      const elapsed = Date.now() - this.lastFailureAt
      if (elapsed >= this.options.resetTimeoutMs) {
        this.state = 'HALF_OPEN'
      }
    }
    return this.state
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.getState()
    if (current === 'OPEN') {
      throw new Error('CircuitBreaker is OPEN')
    }
    try {
      const result = await fn()
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED'
        this.failures = 0
        this.lastFailureAt = null
      }
      return result
    } catch (err) {
      this.failures++
      this.lastFailureAt = Date.now()
      if (this.failures >= this.options.failureThreshold) {
        this.state = 'OPEN'
      }
      throw err
    }
  }
}
