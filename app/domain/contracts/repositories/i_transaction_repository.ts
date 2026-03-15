import type { TransactionEntity, TransactionProductItem } from '#domain/entities/transaction.entity'
import type { TransactionStatus } from '#domain/enums/transaction_status.enum'

export interface CreateTransactionDTO {
  clientId: number
  gatewayId: number
  externalId: string
  status: TransactionStatus
  amount: number
  cardLastNumbers: string
  products: TransactionProductItem[]
}

export interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<TransactionEntity>
  findById(id: number): Promise<TransactionEntity | null>
  findAll(): Promise<TransactionEntity[]>
  updateStatus(id: number, status: TransactionStatus): Promise<void>
}
