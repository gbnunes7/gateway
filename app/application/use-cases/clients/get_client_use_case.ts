import type { IClientRepository } from '#domain/contracts/repositories/i_client_repository'
import type { ClientEntity } from '#domain/entities/client.entity'
import type { TransactionEntity } from '#domain/entities/transaction.entity'

export class ClientNotFoundError extends Error {
  constructor(id: number) {
    super(`Client ${id} not found`)
    this.name = 'ClientNotFoundError'
  }
}

export class GetClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: number): Promise<ClientEntity & { transactions: TransactionEntity[] }> {
    const client = await this.clientRepository.findWithTransactions(id)
    if (!client) throw new ClientNotFoundError(id)
    return client
  }
}
