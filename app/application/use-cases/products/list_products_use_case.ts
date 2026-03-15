import type { IProductRepository } from '#domain/contracts/repositories/i_product_repository'
import type { ProductEntity } from '#domain/entities/product.entity'

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return this.productRepository.findAll()
  }
}
