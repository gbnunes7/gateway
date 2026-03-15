import type { IUserRepository } from '#domain/contracts/repositories/i_user_repository'

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<void> {
    await this.userRepository.delete(id)
  }
}
