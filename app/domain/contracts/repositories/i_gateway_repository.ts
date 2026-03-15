import type { GatewayEntity } from '#domain/entities/gateway.entity'

export interface IGatewayRepository {
  findById(id: number): Promise<GatewayEntity | null>
  findAll(): Promise<GatewayEntity[]>
  findActiveByPriority(): Promise<GatewayEntity[]>
  updateActive(id: number, isActive: boolean): Promise<GatewayEntity>
  updatePriority(id: number, priority: number): Promise<GatewayEntity>
}
