import type { IClientRepository } from '#domain/contracts/repositories/i_client_repository'
import type { ClientEntity } from '#domain/entities/client.entity'

export class ListClientsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(): Promise<ClientEntity[]> {
    return this.clientRepository.findAll()
  }
}
