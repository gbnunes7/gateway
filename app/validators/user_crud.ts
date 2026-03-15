import vine from '@vinejs/vine'
import { Role } from '#domain/enums/role.enum'

const roleEnum = vine.enum([Role.ADMIN, Role.MANAGER, Role.FINANCE, Role.USER])

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().maxLength(254),
    password: vine.string().minLength(8).maxLength(32),
    role: roleEnum,
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    email: vine.string().email().maxLength(254).optional(),
    password: vine.string().minLength(8).maxLength(32).optional(),
    role: roleEnum.optional(),
  })
)
