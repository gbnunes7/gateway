import type { ApplicationService } from '@adonisjs/core/types'
import { LucidUserRepository } from '#infra/database/repositories/lucid_user_repository'
import { LucidClientRepository } from '#infra/database/repositories/lucid_client_repository'
import { LucidProductRepository } from '#infra/database/repositories/lucid_product_repository'
import { LucidTransactionRepository } from '#infra/database/repositories/lucid_transaction_repository'
import { LucidGatewayRepository } from '#infra/database/repositories/lucid_gateway_repository'
import { Gateway1Adapter } from '#infra/gateways/gateway1_adapter'
import { Gateway2Adapter } from '#infra/gateways/gateway2_adapter'
import { PaymentServiceResolverImpl } from '#infra/gateways/payment_service_resolver'
import { CircuitBreaker } from '#application/services/circuit_breaker'
import { PaymentService } from '#application/services/payment_service'
import { LoginUseCase } from '#application/use-cases/auth/login_use_case'
import { CreateUserUseCase } from '#application/use-cases/users/create_user_use_case'
import { UpdateUserUseCase } from '#application/use-cases/users/update_user_use_case'
import { DeleteUserUseCase } from '#application/use-cases/users/delete_user_use_case'
import { ListUsersUseCase } from '#application/use-cases/users/list_users_use_case'
import { CreateProductUseCase } from '#application/use-cases/products/create_product_use_case'
import { UpdateProductUseCase } from '#application/use-cases/products/update_product_use_case'
import { DeleteProductUseCase } from '#application/use-cases/products/delete_product_use_case'
import { ListProductsUseCase } from '#application/use-cases/products/list_products_use_case'
import { ListClientsUseCase } from '#application/use-cases/clients/list_clients_use_case'
import { GetClientUseCase } from '#application/use-cases/clients/get_client_use_case'
import { PurchaseUseCase } from '#application/use-cases/transactions/purchase_use_case'
import { RefundUseCase } from '#application/use-cases/transactions/refund_use_case'
import { ListTransactionsUseCase } from '#application/use-cases/transactions/list_transactions_use_case'
import { GetTransactionUseCase } from '#application/use-cases/transactions/get_transaction_use_case'
import { ToggleGatewayUseCase } from '#application/use-cases/gateways/toggle_gateway_use_case'
import { UpdateGatewayPriorityUseCase } from '#application/use-cases/gateways/update_gateway_priority_use_case'
import type { PaymentServiceAdapterResolver } from '#application/services/payment_service'
import type { PaymentServiceResolverDeps } from '#infra/gateways/payment_service_resolver'
import hash from '@adonisjs/core/services/hash'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    const bind = (key: string, fn: (...args: any[]) => unknown | Promise<unknown>) => {
      this.app.container.singleton(key as never, fn as never)
    }

    bind('IUserRepository', () => new LucidUserRepository())
    bind('IClientRepository', () => new LucidClientRepository())
    bind('IProductRepository', () => new LucidProductRepository())
    bind('ITransactionRepository', () => new LucidTransactionRepository())
    bind('IGatewayRepository', () => new LucidGatewayRepository())

    bind('Gateway1Adapter', () => new Gateway1Adapter())
    bind('Gateway2Adapter', () => new Gateway2Adapter())
    bind('CircuitBreaker1', () => new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 }))
    bind('CircuitBreaker2', () => new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 }))

    bind('PaymentServiceAdapterResolver', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const gateway1Adapter = await resolver.make('Gateway1Adapter')
      const gateway2Adapter = await resolver.make('Gateway2Adapter')
      const circuitBreaker1 = await resolver.make('CircuitBreaker1')
      const circuitBreaker2 = await resolver.make('CircuitBreaker2')
      return new PaymentServiceResolverImpl({
        gateway1Adapter,
        gateway2Adapter,
        circuitBreaker1,
        circuitBreaker2,
      } as PaymentServiceResolverDeps)
    })

    bind('PaymentService', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const adapterResolver = await resolver.make('PaymentServiceAdapterResolver')
      return new PaymentService(adapterResolver as PaymentServiceAdapterResolver)
    })

    bind('PasswordHasher', () => ({
      verify: (plain: string, hashed: string) => hash.verify(hashed, plain),
    }))

    bind('LoginUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const userRepo = await resolver.make('IUserRepository')
      const hasher = await resolver.make('PasswordHasher')
      return new LoginUseCase(userRepo as never, hasher as never)
    })

    bind('CreateUserUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const userRepo = await resolver.make('IUserRepository')
      return new CreateUserUseCase(userRepo as never)
    })
    bind('UpdateUserUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const userRepo = await resolver.make('IUserRepository')
      return new UpdateUserUseCase(userRepo as never)
    })
    bind('DeleteUserUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const userRepo = await resolver.make('IUserRepository')
      return new DeleteUserUseCase(userRepo as never)
    })
    bind('ListUsersUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const userRepo = await resolver.make('IUserRepository')
      return new ListUsersUseCase(userRepo as never)
    })

    bind('CreateProductUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const productRepo = await resolver.make('IProductRepository')
      return new CreateProductUseCase(productRepo as never)
    })
    bind('UpdateProductUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const productRepo = await resolver.make('IProductRepository')
      return new UpdateProductUseCase(productRepo as never)
    })
    bind('DeleteProductUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const productRepo = await resolver.make('IProductRepository')
      return new DeleteProductUseCase(productRepo as never)
    })
    bind('ListProductsUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const productRepo = await resolver.make('IProductRepository')
      return new ListProductsUseCase(productRepo as never)
    })

    bind('ListClientsUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const clientRepo = await resolver.make('IClientRepository')
      return new ListClientsUseCase(clientRepo as never)
    })
    bind('GetClientUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const clientRepo = await resolver.make('IClientRepository')
      return new GetClientUseCase(clientRepo as never)
    })

    bind('PurchaseUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const productRepo = await resolver.make('IProductRepository')
      const clientRepo = await resolver.make('IClientRepository')
      const transactionRepo = await resolver.make('ITransactionRepository')
      const gatewayRepo = await resolver.make('IGatewayRepository')
      const paymentService = await resolver.make('PaymentService')
      return new PurchaseUseCase(
        productRepo as never,
        clientRepo as never,
        transactionRepo as never,
        gatewayRepo as never,
        paymentService as never
      )
    })
    bind('RefundUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const transactionRepo = await resolver.make('ITransactionRepository')
      const gatewayRepo = await resolver.make('IGatewayRepository')
      const adapterResolver = await resolver.make('PaymentServiceAdapterResolver')
      return new RefundUseCase(transactionRepo as never, gatewayRepo as never, adapterResolver as never)
    })
    bind('ListTransactionsUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const transactionRepo = await resolver.make('ITransactionRepository')
      return new ListTransactionsUseCase(transactionRepo as never)
    })
    bind('GetTransactionUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const transactionRepo = await resolver.make('ITransactionRepository')
      return new GetTransactionUseCase(transactionRepo as never)
    })

    bind('ToggleGatewayUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const gatewayRepo = await resolver.make('IGatewayRepository')
      return new ToggleGatewayUseCase(gatewayRepo as never)
    })
    bind('UpdateGatewayPriorityUseCase', async (resolver: { make: (k: string) => Promise<unknown> }) => {
      const gatewayRepo = await resolver.make('IGatewayRepository')
      return new UpdateGatewayPriorityUseCase(gatewayRepo as never)
    })
  }
}
