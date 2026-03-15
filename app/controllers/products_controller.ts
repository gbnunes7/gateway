import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { createProductValidator, updateProductValidator } from '#validators/product'
import { ProductNotFoundError } from '#application/use-cases/products/update_product_use_case'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const useCase = await app.container.make('ListProductsUseCase') as any
    const products = await useCase.execute()
    return response.ok({
      data: products.map((p: { id: number; name: string; amount: number }) => ({ id: p.id, name: p.name, amount: p.amount })),
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const useCase = await app.container.make('CreateProductUseCase') as any
    const product = await useCase.execute(payload)
    return response.created({
      data: { id: product.id, name: product.name, amount: product.amount },
    })
  }

  async update({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const payload = await request.validateUsing(updateProductValidator)
    const useCase = await app.container.make('UpdateProductUseCase') as any
    try {
      const product = await useCase.execute(id, payload)
      return response.ok({
        data: { id: product.id, name: product.name, amount: product.amount },
      })
    } catch (err) {
      if (err instanceof ProductNotFoundError) return response.notFound({ message: err.message })
      throw err
    }
  }

  async destroy({ params, response }: HttpContext) {
    const id = Number(params.id)
    const useCase = await app.container.make('DeleteProductUseCase') as any
    await useCase.execute(id)
    return response.noContent()
  }
}
