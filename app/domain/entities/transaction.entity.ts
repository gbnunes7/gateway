import type { TransactionStatus } from '#domain/enums/transaction_status.enum'

export interface TransactionProductItem {
  productId: number
  quantity: number
}

export interface TransactionEntity {
  id: number
  clientId: number
  gatewayId: number
  externalId: string
  status: TransactionStatus
  amount: number
  cardLastNumbers: string
  createdAt: Date
  updatedAt: Date
}

export interface TransactionWithProductsEntity extends TransactionEntity {
  products: TransactionProductItem[]
}
