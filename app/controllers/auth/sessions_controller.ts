import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import { loginValidator } from '#validators/user'
import { InvalidCredentialsError } from '#application/use-cases/auth/login_use_case'
export default class SessionsController {
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const loginUseCase = await app.container.make('LoginUseCase') as any
    try {
      const userEntity = await loginUseCase.execute({ email, password })
      const user = await User.findOrFail(userEntity.id)
      const token = await User.accessTokens.create(user)
      return response.ok({
        data: {
          user: { id: user.id, name: user.fullName ?? user.email, email: user.email, role: user.role },
          token: token.value!.release(),
        },
      })
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }
      throw err
    }
  }
}
