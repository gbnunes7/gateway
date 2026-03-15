import type { ITransactionRepository } from '#domain/contracts/repositories/i_transaction_repository'
import type { IGatewayRepository } from '#domain/contracts/repositories/i_gateway_repository'
import type { PaymentServiceAdapterResolver } from '#application/services/payment_service'
import { TransactionStatus } from '#domain/enums/transaction_status.enum'

export class TransactionNotFoundError extends Error {
  constructor(id: number) {
    super(`Transaction ${id} not found`)
    this.name = 'TransactionNotFoundError'
  }
}

export class RefundUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly gatewayRepository: IGatewayRepository,
    private readonly adapterResolver: PaymentServiceAdapterResolver
  ) {}

  async execute(transactionId: number): Promise<void> {
    const transaction = await this.transactionRepository.findById(transactionId)
    if (!transaction) throw new TransactionNotFoundError(transactionId)
    if (transaction.status === TransactionStatus.REFUNDED) {
      throw new Error('Transaction already refunded')
    }
    if (transaction.status !== TransactionStatus.PAID) {
      throw new Error('Only paid transactions can be refunded')
    }
    const gateway = await this.gatewayRepository.findById(transaction.gatewayId)
    if (!gateway) throw new Error('Gateway not found')
    const adapter = this.adapterResolver.getAdapter(gateway)
    await adapter.refund(transaction.externalId)
    await this.transactionRepository.updateStatus(transactionId, TransactionStatus.REFUNDED)
  }
}
