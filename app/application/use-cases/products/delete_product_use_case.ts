import type { IProductRepository } from '#domain/contracts/repositories/i_product_repository'

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number): Promise<void> {
    await this.productRepository.delete(id)
  }
}
