import type { IUserRepository, CreateUserDTO, UpdateUserDTO } from '#domain/contracts/repositories/i_user_repository'
import type { UserEntity } from '#domain/entities/user.entity'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

function toEntity(user: User): UserEntity {
  return {
    id: user.id,
    name: user.fullName ?? user.email,
    email: user.email,
    password: user.password,
    role: user.role as UserEntity['role'],
    createdAt: user.createdAt.toJSDate(),
    updatedAt: user.updatedAt!.toJSDate(),
  }
}

export class LucidUserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<UserEntity> {
    const hashedPassword = await hash.make(data.password)
    const user = await User.create({
      fullName: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    })
    return toEntity(user)
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await User.find(id)
    return user ? toEntity(user) : null
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await User.findBy('email', email)
    return user ? toEntity(user) : null
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await User.all()
    return users.map(toEntity)
  }

  async update(id: number, data: UpdateUserDTO): Promise<UserEntity> {
    const user = await User.findOrFail(id)
    if (data.name !== undefined) user.fullName = data.name
    if (data.email !== undefined) user.email = data.email
    if (data.role !== undefined) user.role = data.role
    if (data.password !== undefined) user.password = await hash.make(data.password)
    await user.save()
    return toEntity(user)
  }

  async delete(id: number): Promise<void> {
    const user = await User.findOrFail(id)
    await user.delete()
  }
}
