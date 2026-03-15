import type { IUserRepository } from '#domain/contracts/repositories/i_user_repository'
import type { UserEntity } from '#domain/entities/user.entity'

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }
}
