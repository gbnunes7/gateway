import type { UserEntity } from '#domain/entities/user.entity'

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role: string
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
  role?: string
}

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<UserEntity>
  findById(id: number): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  findAll(): Promise<UserEntity[]>
  update(id: number, data: UpdateUserDTO): Promise<UserEntity>
  delete(id: number): Promise<void>
}
