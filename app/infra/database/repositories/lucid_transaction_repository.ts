import type {
  ITransactionRepository,
  CreateTransactionDTO,
} from '#domain/contracts/repositories/i_transaction_repository'
import type { TransactionEntity } from '#domain/entities/transaction.entity'
import { TransactionStatus } from '#domain/enums/transaction_status.enum'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'

function toEntity(t: Transaction): TransactionEntity {
  return {
    id: t.id,
    clientId: t.clientId,
    gatewayId: t.gatewayId,
    externalId: t.externalId,
    status: t.status as TransactionEntity['status'],
    amount: t.amount,
    cardLastNumbers: t.cardLastNumbers,
    createdAt: t.createdAt.toJSDate(),
    updatedAt: t.updatedAt!.toJSDate(),
  }
}

export class LucidTransactionRepository implements ITransactionRepository {
  async create(data: CreateTransactionDTO): Promise<TransactionEntity> {
    const transaction = await Transaction.create({
      clientId: data.clientId,
      gatewayId: data.gatewayId,
      externalId: data.externalId,
      status: data.status,
      amount: data.amount,
      cardLastNumbers: data.cardLastNumbers,
    })
    for (const p of data.products) {
      await TransactionProduct.create({
        transactionId: transaction.id,
        productId: p.productId,
        quantity: p.quantity,
      })
    }
    return toEntity(transaction)
  }

  async findById(id: number): Promise<TransactionEntity | null> {
    const transaction = await Transaction.find(id)
    return transaction ? toEntity(transaction) : null
  }

  async findAll(): Promise<TransactionEntity[]> {
    const transactions = await Transaction.all()
    return transactions.map(toEntity)
  }

  async updateStatus(id: number, status: TransactionStatus): Promise<void> {
    const transaction = await Transaction.findOrFail(id)
    transaction.status = status
    await transaction.save()
  }
}
