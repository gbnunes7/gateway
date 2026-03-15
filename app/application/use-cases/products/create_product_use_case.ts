import type { IProductRepository } from '#domain/contracts/repositories/i_product_repository'
import type { ProductEntity } from '#domain/entities/product.entity'
import type { CreateProductDTO } from '#domain/contracts/repositories/i_product_repository'

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<ProductEntity> {
    return this.productRepository.create(dto)
  }
}
