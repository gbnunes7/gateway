import type { IUserRepository } from '#domain/contracts/repositories/i_user_repository'
import type { UserEntity } from '#domain/entities/user.entity'
import type { CreateUserDTO } from '#domain/contracts/repositories/i_user_repository'

export interface CreateUserUseCaseDTO extends CreateUserDTO {}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserUseCaseDTO): Promise<UserEntity> {
    return this.userRepository.create(dto)
  }
}
