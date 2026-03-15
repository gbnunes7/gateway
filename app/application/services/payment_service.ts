import type { GatewayEntity } from '#domain/entities/gateway.entity'
import type { ChargeDTO, ChargeResponseDTO, IGatewayAdapter } from '#domain/contracts/gateways/i_gateway_adapter'
import type { CircuitBreaker } from './circuit_breaker.js'

export class AllGatewaysFailedError extends Error {
  constructor() {
    super('All payment gateways failed')
    this.name = 'AllGatewaysFailedError'
  }
}

export interface PaymentServiceAdapterResolver {
  getAdapter(gateway: GatewayEntity): IGatewayAdapter
  getCircuitBreaker(gateway: GatewayEntity): CircuitBreaker
}

export class PaymentService {
  constructor(private readonly adapterResolver: PaymentServiceAdapterResolver) {}

  async charge(gateways: GatewayEntity[], data: ChargeDTO): Promise<{ response: ChargeResponseDTO; gateway: GatewayEntity }> {
    const sorted = [...gateways].sort((a, b) => a.priority - b.priority)
    let lastError: Error | null = null
    for (const gateway of sorted) {
      if (!gateway.isActive) continue
      const adapter = this.adapterResolver.getAdapter(gateway)
      const breaker = this.adapterResolver.getCircuitBreaker(gateway)
      if (breaker.getState() === 'OPEN') continue
      try {
        const response = await breaker.execute(() => adapter.charge(data))
        return { response, gateway }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }
    throw lastError ?? new AllGatewaysFailedError()
  }

  async refund(adapter: IGatewayAdapter, externalId: string): Promise<void> {
    await adapter.refund(externalId)
  }
}
