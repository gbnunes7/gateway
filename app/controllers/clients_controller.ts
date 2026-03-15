import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { ClientNotFoundError } from '#application/use-cases/clients/get_client_use_case'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const useCase = await app.container.make('ListClientsUseCase') as any
    const clients = await useCase.execute()
    return response.ok({
      data: clients.map((c: { id: number; name: string; email: string }) => ({ id: c.id, name: c.name, email: c.email })),
    })
  }

  async show({ params, response }: HttpContext) {
    const id = Number(params.id)
    const useCase = await app.container.make('GetClientUseCase') as any
    try {
      const client = await useCase.execute(id)
      return response.ok({
        data: {
          id: client.id,
          name: client.name,
          email: client.email,
          transactions: client.transactions.map((t: { id: number; gatewayId: number; externalId: string; status: string; amount: number; cardLastNumbers: string }) => ({
            id: t.id,
            gatewayId: t.gatewayId,
            externalId: t.externalId,
            status: t.status,
            amount: t.amount,
            cardLastNumbers: t.cardLastNumbers,
          })),
        },
      })
    } catch (err) {
      if (err instanceof ClientNotFoundError) return response.notFound({ message: err.message })
      throw err
    }
  }
}
