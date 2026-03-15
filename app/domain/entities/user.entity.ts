import type { Role } from '#domain/enums/role.enum'

export interface UserEntity {
  id: number
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}
