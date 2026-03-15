import type { GatewayEntity } from '#domain/entities/gateway.entity'
import type { PaymentServiceAdapterResolver } from '#application/services/payment_service'
import type { IGatewayAdapter } from '#domain/contracts/gateways/i_gateway_adapter'
import type { CircuitBreaker } from '#application/services/circuit_breaker'

export interface PaymentServiceResolverDeps {
  gateway1Adapter: IGatewayAdapter
  gateway2Adapter: IGatewayAdapter
  circuitBreaker1: CircuitBreaker
  circuitBreaker2: CircuitBreaker
}

export class PaymentServiceResolverImpl implements PaymentServiceAdapterResolver {
  constructor(private deps: PaymentServiceResolverDeps) {}

  getAdapter(gateway: GatewayEntity): IGatewayAdapter {
    if (gateway.id === 1 || gateway.name.toLowerCase().includes('gateway 1')) {
      return this.deps.gateway1Adapter
    }
    return this.deps.gateway2Adapter
  }

  getCircuitBreaker(gateway: GatewayEntity): CircuitBreaker {
    if (gateway.id === 1 || gateway.name.toLowerCase().includes('gateway 1')) {
      return this.deps.circuitBreaker1
    }
    return this.deps.circuitBreaker2
  }
}
