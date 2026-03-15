import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { purchaseValidator } from '#validators/purchase'
import { AllGatewaysFailedError } from '#application/services/payment_service'
import { TransactionNotFoundError } from '#application/use-cases/transactions/get_transaction_use_case'
import { TransactionNotFoundError as RefundTransactionNotFoundError } from '#application/use-cases/transactions/refund_use_case'

export default class TransactionsController {
  async purchase({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)
    const useCase = await app.container.make('PurchaseUseCase') as any
    try {
      const transaction = await useCase.execute({
        name: payload.name,
        email: payload.email,
        cardNumber: payload.cardNumber,
        cvv: payload.cvv,
        items: payload.items,
      })
      return response.ok({
        data: {
          id: transaction.id,
          clientId: transaction.clientId,
          gatewayId: transaction.gatewayId,
          externalId: transaction.externalId,
          status: transaction.status,
          amount: transaction.amount,
          cardLastNumbers: transaction.cardLastNumbers,
        },
      })
    } catch (err) {
      if (err instanceof AllGatewaysFailedError) {
        return response.unprocessableEntity({ message: 'All payment gateways failed' })
      }
      throw err
    }
  }

  async index({ response }: HttpContext) {
    const useCase = await app.container.make('ListTransactionsUseCase') as any
    const transactions = await useCase.execute()
    return response.ok({
      data: transactions.map((t: { id: number; clientId: number; gatewayId: number; externalId: string; status: string; amount: number; cardLastNumbers: string }) => ({
        id: t.id,
        clientId: t.clientId,
        gatewayId: t.gatewayId,
        externalId: t.externalId,
        status: t.status,
        amount: t.amount,
        cardLastNumbers: t.cardLastNumbers,
      })),
    })
  }

  async show({ params, response }: HttpContext) {
    const id = Number(params.id)
    const useCase = await app.container.make('GetTransactionUseCase') as any
    try {
      const transaction = await useCase.execute(id)
      return response.ok({
        data: {
          id: transaction.id,
          clientId: transaction.clientId,
          gatewayId: transaction.gatewayId,
          externalId: transaction.externalId,
          status: transaction.status,
          amount: transaction.amount,
          cardLastNumbers: transaction.cardLastNumbers,
        },
      })
    } catch (err) {
      if (err instanceof TransactionNotFoundError) return response.notFound({ message: err.message })
      throw err
    }
  }

  async refund({ params, response }: HttpContext) {
    const id = Number(params.id)
    const useCase = await app.container.make('RefundUseCase') as any
    try {
      await useCase.execute(id)
      return response.ok({ message: 'Refund successful' })
    } catch (err) {
      if (err instanceof RefundTransactionNotFoundError) return response.notFound({ message: err.message })
      if (err instanceof Error && err.message.includes('already refunded')) {
        return response.unprocessableEntity({ message: err.message })
      }
      if (err instanceof Error && err.message.includes('Only paid')) {
        return response.unprocessableEntity({ message: err.message })
      }
      throw err
    }
  }
}
