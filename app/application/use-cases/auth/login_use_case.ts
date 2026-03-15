import type { IUserRepository } from '#domain/contracts/repositories/i_user_repository'
import type { UserEntity } from '#domain/entities/user.entity'

export interface LoginDTO {
  email: string
  password: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
    this.name = 'InvalidCredentialsError'
  }
}

export interface PasswordHasher {
  verify(plain: string, hashed: string): Promise<boolean>
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(dto: LoginDTO): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(dto.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }
    const valid = await this.hasher.verify(dto.password, user.password)
    if (!valid) {
      throw new InvalidCredentialsError()
    }
    return user
  }
}
