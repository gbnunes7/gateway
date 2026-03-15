import type {
  IProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
} from '#domain/contracts/repositories/i_product_repository'
import type { ProductEntity } from '#domain/entities/product.entity'
import Product from '#models/product'

function toEntity(product: Product): ProductEntity {
  return {
    id: product.id,
    name: product.name,
    amount: product.amount,
    createdAt: product.createdAt.toJSDate(),
    updatedAt: product.updatedAt!.toJSDate(),
  }
}

export class LucidProductRepository implements IProductRepository {
  async create(data: CreateProductDTO): Promise<ProductEntity> {
    const product = await Product.create(data)
    return toEntity(product)
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await Product.find(id)
    return product ? toEntity(product) : null
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await Product.all()
    return products.map(toEntity)
  }

  async update(id: number, data: UpdateProductDTO): Promise<ProductEntity> {
    const product = await Product.findOrFail(id)
    if (data.name !== undefined) product.name = data.name
    if (data.amount !== undefined) product.amount = data.amount
    await product.save()
    return toEntity(product)
  }

  async delete(id: number): Promise<void> {
    const product = await Product.findOrFail(id)
    await product.delete()
  }
}
