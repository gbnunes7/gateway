import type { IUserRepository } from '#domain/contracts/repositories/i_user_repository'
import type { UserEntity } from '#domain/entities/user.entity'
import type { UpdateUserDTO } from '#domain/contracts/repositories/i_user_repository'

export class UserNotFoundError extends Error {
  constructor(id: number) {
    super(`User ${id} not found`)
    this.name = 'UserNotFoundError'
  }
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number, dto: UpdateUserDTO): Promise<UserEntity> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new UserNotFoundError(id)
    return this.userRepository.update(id, dto)
  }
}
