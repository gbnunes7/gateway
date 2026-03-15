export interface ChargeDTO {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface ChargeResponseDTO {
  id: string
  [key: string]: unknown
}

export interface IGatewayAdapter {
  charge(data: ChargeDTO): Promise<ChargeResponseDTO>
  refund(externalId: string): Promise<void>
}
