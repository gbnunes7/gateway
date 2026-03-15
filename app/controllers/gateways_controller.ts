import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { updateGatewayPriorityValidator } from '#validators/gateway'
import { GatewayNotFoundError } from '#application/use-cases/gateways/toggle_gateway_use_case'

export default class GatewaysController {
  async toggle({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const isActive = request.input('isActive', true)
    const useCase = await app.container.make('ToggleGatewayUseCase') as any
    try {
      const gateway = await useCase.execute(id, isActive)
      return response.ok({
        data: { id: gateway.id, name: gateway.name, isActive: gateway.isActive, priority: gateway.priority },
      })
    } catch (err) {
      if (err instanceof GatewayNotFoundError) return response.notFound({ message: err.message })
      throw err
    }
  }

  async updatePriority({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const { priority } = await request.validateUsing(updateGatewayPriorityValidator)
    const useCase = await app.container.make('UpdateGatewayPriorityUseCase') as any
    try {
      const gateway = await useCase.execute(id, priority)
      return response.ok({
        data: { id: gateway.id, name: gateway.name, isActive: gateway.isActive, priority: gateway.priority },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found'))
        return response.notFound({ message: err.message })
      throw err
    }
  }
}
