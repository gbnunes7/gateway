import type { ClientEntity } from '#domain/entities/client.entity'
import type { TransactionEntity } from '#domain/entities/transaction.entity'

export interface CreateClientDTO {
  name: string
  email: string
}

export interface IClientRepository {
  create(data: CreateClientDTO): Promise<ClientEntity>
  findById(id: number): Promise<ClientEntity | null>
  findByEmail(email: string): Promise<ClientEntity | null>
  findOrCreate(data: CreateClientDTO): Promise<ClientEntity>
  findAll(): Promise<ClientEntity[]>
  findWithTransactions(id: number): Promise<(ClientEntity & { transactions: TransactionEntity[] }) | null>
}
