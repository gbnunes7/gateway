import type { IGatewayAdapter, ChargeDTO, ChargeResponseDTO } from '#domain/contracts/gateways/i_gateway_adapter'
import env from '#start/env'
import axios from 'axios'

const BASE_URL = env.get('GATEWAY_2_URL')

function getHeaders() {
  return {
    'Gateway-Auth-Token': env.get('GATEWAY_2_AUTH_TOKEN'),
    'Gateway-Auth-Secret': env.get('GATEWAY_2_AUTH_SECRET'),
  }
}

export class Gateway2Adapter implements IGatewayAdapter {
  async charge(data: ChargeDTO): Promise<ChargeResponseDTO> {
    const { data: res } = await axios.post<{ id: string }>(
      `${BASE_URL}/transacoes`,
      {
        valor: data.amount,
        nome: data.name,
        email: data.email,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
      },
      { headers: getHeaders() }
    )
    return { id: res.id }
  }

  async refund(externalId: string): Promise<void> {
    await axios.post(
      `${BASE_URL}/transacoes/reembolso`,
      { id: externalId },
      { headers: getHeaders() }
    )
  }
}
