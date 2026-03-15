import type { ITransactionRepository } from '#domain/contracts/repositories/i_transaction_repository'
import type { TransactionEntity } from '#domain/entities/transaction.entity'

export class TransactionNotFoundError extends Error {
  constructor(id: number) {
    super(`Transaction ${id} not found`)
    this.name = 'TransactionNotFoundError'
  }
}

export class GetTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(id: number): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new TransactionNotFoundError(id)
    return transaction
  }
}
