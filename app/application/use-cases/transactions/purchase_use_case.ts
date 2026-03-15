import type { IProductRepository } from '#domain/contracts/repositories/i_product_repository'
import type { IClientRepository } from '#domain/contracts/repositories/i_client_repository'
import type { ITransactionRepository } from '#domain/contracts/repositories/i_transaction_repository'
import type { IGatewayRepository } from '#domain/contracts/repositories/i_gateway_repository'
import type { TransactionEntity } from '#domain/entities/transaction.entity'
import { TransactionStatus } from '#domain/enums/transaction_status.enum'
import type { PaymentService } from '#application/services/payment_service'

export interface PurchaseItemDTO {
  productId: number
  quantity: number
}

export interface PurchaseDTO {
  name: string
  email: string
  cardNumber: string
  cvv: string
  items: PurchaseItemDTO[]
}

export class PurchaseUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly clientRepository: IClientRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly gatewayRepository: IGatewayRepository,
    private readonly paymentService: PaymentService
  ) {}

  async execute(dto: PurchaseDTO): Promise<TransactionEntity> {
    const client = await this.clientRepository.findOrCreate({ name: dto.name, email: dto.email })
    let totalAmount = 0
    const productsToSave: { productId: number; quantity: number }[] = []
    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId)
      if (!product) throw new Error(`Product ${item.productId} not found`)
      totalAmount += product.amount * item.quantity
      productsToSave.push({ productId: item.productId, quantity: item.quantity })
    }
    const gateways = await this.gatewayRepository.findActiveByPriority()
    if (gateways.length === 0) throw new Error('No active gateways')
    try {
      const { response, gateway } = await this.paymentService.charge(gateways, {
        amount: totalAmount,
        name: dto.name,
        email: dto.email,
        cardNumber: dto.cardNumber,
        cvv: dto.cvv,
      })
      const externalId = typeof response.id === 'string' ? response.id : String(response.id)
      const cardLastNumbers = dto.cardNumber.slice(-4)
      return this.transactionRepository.create({
        clientId: client.id,
        gatewayId: gateway.id,
        externalId,
        status: TransactionStatus.PAID,
        amount: totalAmount,
        cardLastNumbers,
        products: productsToSave,
      })
    } catch (err) {
      throw err
    }
  }
}
