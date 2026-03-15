import type { IProductRepository } from '#domain/contracts/repositories/i_product_repository'
import type { ProductEntity } from '#domain/entities/product.entity'
import type { UpdateProductDTO } from '#domain/contracts/repositories/i_product_repository'

export class ProductNotFoundError extends Error {
  constructor(id: number) {
    super(`Product ${id} not found`)
    this.name = 'ProductNotFoundError'
  }
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number, dto: UpdateProductDTO): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id)
    if (!product) throw new ProductNotFoundError(id)
    return this.productRepository.update(id, dto)
  }
}
