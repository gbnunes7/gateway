import vine from '@vinejs/vine'

export const updateGatewayPriorityValidator = vine.compile(
  vine.object({
    priority: vine.number().positive().min(1),
  })
)
