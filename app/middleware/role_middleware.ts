import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Role } from '#domain/enums/role.enum'

type RoleOption = (typeof Role)[keyof typeof Role] | keyof typeof Role

export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { allowedRoles: RoleOption[] } = { allowedRoles: [] }
  ) {
    const user = ctx.auth.user
    if (!user) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }
    const userRole = (user as { role?: string }).role
    const allowed = options.allowedRoles.map((r) =>
      typeof r === 'string' && r in Role ? (Role as Record<string, string>)[r] : r
    )
    if (!userRole || !allowed.includes(userRole)) {
      return ctx.response.forbidden({ message: 'Insufficient permissions' })
    }
    return next()
  }
}
