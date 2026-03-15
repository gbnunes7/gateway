import type { ProductEntity } from '#domain/entities/product.entity'

export interface CreateProductDTO {
  name: string
  amount: number
}

export interface UpdateProductDTO {
  name?: string
  amount?: number
}

export interface IProductRepository {
  create(data: CreateProductDTO): Promise<ProductEntity>
  findById(id: number): Promise<ProductEntity | null>
  findAll(): Promise<ProductEntity[]>
  update(id: number, data: UpdateProductDTO): Promise<ProductEntity>
  delete(id: number): Promise<void>
}
