import type { IGatewayRepository } from '#domain/contracts/repositories/i_gateway_repository'
import type { GatewayEntity } from '#domain/entities/gateway.entity'

export class GatewayNotFoundError extends Error {
  constructor(id: number) {
    super(`Gateway ${id} not found`)
    this.name = 'GatewayNotFoundError'
  }
}

export class ToggleGatewayUseCase {
  constructor(private readonly gatewayRepository: IGatewayRepository) {}

  async execute(id: number, isActive: boolean): Promise<GatewayEntity> {
    const gateway = await this.gatewayRepository.findById(id)
    if (!gateway) throw new GatewayNotFoundError(id)
    return this.gatewayRepository.updateActive(id, isActive)
  }
}
