import type { IGatewayRepository } from '#domain/contracts/repositories/i_gateway_repository'
import type { GatewayEntity } from '#domain/entities/gateway.entity'
import Gateway from '#models/gateway'

function toEntity(gateway: Gateway): GatewayEntity {
  return {
    id: gateway.id,
    name: gateway.name,
    isActive: gateway.isActive,
    priority: gateway.priority,
    createdAt: gateway.createdAt.toJSDate(),
    updatedAt: gateway.updatedAt.toJSDate(),
  }
}

export class LucidGatewayRepository implements IGatewayRepository {
  async findById(id: number): Promise<GatewayEntity | null> {
    const gateway = await Gateway.find(id)
    return gateway ? toEntity(gateway) : null
  }

  async findAll(): Promise<GatewayEntity[]> {
    const gateways = await Gateway.all()
    return gateways.map(toEntity)
  }

  async findActiveByPriority(): Promise<GatewayEntity[]> {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')
    return gateways.map(toEntity)
  }

  async updateActive(id: number, isActive: boolean): Promise<GatewayEntity> {
    const gateway = await Gateway.findOrFail(id)
    gateway.isActive = isActive
    await gateway.save()
    return toEntity(gateway)
  }

  async updatePriority(id: number, priority: number): Promise<GatewayEntity> {
    const gateway = await Gateway.findOrFail(id)
    gateway.priority = priority
    await gateway.save()
    return toEntity(gateway)
  }
}
