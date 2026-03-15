import type { IClientRepository, CreateClientDTO } from '#domain/contracts/repositories/i_client_repository'
import type { ClientEntity } from '#domain/entities/client.entity'
import type { TransactionEntity } from '#domain/entities/transaction.entity'
import Client from '#models/client'
import Transaction from '#models/transaction'

function toEntity(client: Client): ClientEntity {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    createdAt: client.createdAt.toJSDate(),
    updatedAt: client.updatedAt!.toJSDate(),
  }
}

function toTransactionEntity(t: Transaction): TransactionEntity {
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

export class LucidClientRepository implements IClientRepository {
  async create(data: CreateClientDTO): Promise<ClientEntity> {
    const client = await Client.create(data)
    return toEntity(client)
  }

  async findById(id: number): Promise<ClientEntity | null> {
    const client = await Client.find(id)
    return client ? toEntity(client) : null
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const client = await Client.findBy('email', email)
    return client ? toEntity(client) : null
  }

  async findOrCreate(data: CreateClientDTO): Promise<ClientEntity> {
    let client = await Client.findBy('email', data.email)
    if (!client) {
      client = await Client.create(data)
    }
    return toEntity(client)
  }

  async findAll(): Promise<ClientEntity[]> {
    const clients = await Client.all()
    return clients.map(toEntity)
  }

  async findWithTransactions(id: number): Promise<(ClientEntity & { transactions: TransactionEntity[] }) | null> {
    const client = await Client.query().where('id', id).preload('transactions').first()
    if (!client) return null
    return {
      ...toEntity(client),
      transactions: client.transactions.map(toTransactionEntity),
    }
  }
}
