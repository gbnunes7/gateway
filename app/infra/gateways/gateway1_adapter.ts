import type { IGatewayAdapter, ChargeDTO, ChargeResponseDTO } from '#domain/contracts/gateways/i_gateway_adapter'
import env from '#start/env'
import axios from 'axios'

const BASE_URL = env.get('GATEWAY_1_URL') ?? 'http://localhost:3001'

export class Gateway1Adapter implements IGatewayAdapter {
  private token: string | null = null

  private async getToken(): Promise<string> {
    if (this.token) return this.token
    const { data } = await axios.post<{ token: string }>(`${BASE_URL}/login`, {
      email: env.get('GATEWAY_1_EMAIL') ?? 'dev@betalent.tech',
      token: env.get('GATEWAY_1_TOKEN') ?? 'FEC9BB078BF338F464F96B48089EB498',
    })
    this.token = data.token
    return this.token
  }

  async charge(data: ChargeDTO): Promise<ChargeResponseDTO> {
    const token = await this.getToken()
    const { data: res } = await axios.post<{ id: string }>(
      `${BASE_URL}/transactions`,
      {
        amount: data.amount,
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return { id: res.id }
  }

  async refund(externalId: string): Promise<void> {
    const token = await this.getToken()
    await axios.post(
      `${BASE_URL}/transactions/${externalId}/charge_back`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  }
}
