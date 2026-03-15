import vine from '@vinejs/vine'

const purchaseItemSchema = vine.object({
  productId: vine.number().positive(),
  quantity: vine.number().positive().min(1),
})

export const purchaseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().maxLength(254),
    cardNumber: vine.string().regex(/^\d{16}$/),
    cvv: vine.string().regex(/^\d{3,4}$/),
    items: vine.array(purchaseItemSchema).minLength(1),
  })
)
