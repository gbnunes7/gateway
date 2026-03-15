import type { IGatewayRepository } from '#domain/contracts/repositories/i_gateway_repository'
import type { GatewayEntity } from '#domain/entities/gateway.entity'

export class UpdateGatewayPriorityUseCase {
  constructor(private readonly gatewayRepository: IGatewayRepository) {}

  async execute(id: number, priority: number): Promise<GatewayEntity> {
    const gateway = await this.gatewayRepository.findById(id)
    if (!gateway) throw new Error(`Gateway ${id} not found`)
    return this.gatewayRepository.updatePriority(id, priority)
  }
}
