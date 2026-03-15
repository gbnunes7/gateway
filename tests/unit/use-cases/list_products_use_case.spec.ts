import { test } from '@japa/runner'
import { ListProductsUseCase } from '#application/use-cases/products/list_products_use_case'

test.group('ListProductsUseCase', () => {
  test('returns empty array when repository has no products', async ({ assert }) => {
    const mockRepo = {
      findAll: async () => [],
    }
    const useCase = new ListProductsUseCase(mockRepo as any)
    const result = await useCase.execute()
    assert.equal(result.length, 0)
  })

  test('returns all products from repository', async ({ assert }) => {
    const products = [
      { id: 1, name: 'A', amount: 100, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'B', amount: 200, createdAt: new Date(), updatedAt: new Date() },
    ]
    const mockRepo = {
      findAll: async () => products,
    }
    const useCase = new ListProductsUseCase(mockRepo as any)
    const result = await useCase.execute()
    assert.equal(result.length, 2)
    assert.equal(result[0].name, 'A')
    assert.equal(result[1].amount, 200)
  })
})
