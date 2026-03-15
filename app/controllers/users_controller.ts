import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { createUserValidator, updateUserValidator } from '#validators/user_crud'
import { UserNotFoundError } from '#application/use-cases/users/update_user_use_case'

export default class UsersController {
  async index({ response }: HttpContext) {
    const useCase = await app.container.make('ListUsersUseCase') as any
    const users = await useCase.execute()
    return response.ok({
      data: users.map((u: { id: number; name: string; email: string; role: string }) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const useCase = await app.container.make('CreateUserUseCase') as any
    const user = await useCase.execute(payload)
    return response.created({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  }

  async update({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const payload = await request.validateUsing(updateUserValidator)
    const useCase = await app.container.make('UpdateUserUseCase') as any
    try {
      const user = await useCase.execute(id, payload)
      return response.ok({
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    } catch (err) {
      if (err instanceof UserNotFoundError) return response.notFound({ message: err.message })
      throw err
    }
  }

  async destroy({ params, response }: HttpContext) {
    const id = Number(params.id)
    const useCase = await app.container.make('DeleteUserUseCase') as any
    await useCase.execute(id)
    return response.noContent()
  }
}
