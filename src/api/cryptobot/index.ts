import CONFIG from '../../../CONFIG.json'
import { CryptoBotInvoice, CryptoBotInvoiceParams } from './types'

const BASE_URL = 'https://pay.crypt.bot/api'

const fetchCryptoBot = async (
  endpoint: string,
  options?: RequestInit
) => {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Crypto-Pay-API-Token': CONFIG.CRYPTOBOT.API_KEY,
    },
    ...options,
  })

  const json = await res.json()
  if (!json.ok) {
    console.error('CryptoBot API error payload:', json)
    throw new Error('CryptoBot API error')
  }

  return json.result
}

export const cryptoBotGetMe = async () => {
  return fetchCryptoBot('getMe')
}

export const cryptoBotInvoice = async (
  params: CryptoBotInvoiceParams
): Promise<CryptoBotInvoice> => {
  const res = fetchCryptoBot('createInvoice', {
    method: 'POST',
    body: JSON.stringify(params),
  })

  return res
}

export const cryptoBotCheckInvoice = async (invoice_id: number) => {
  const res: { items: CryptoBotInvoice[] } = await fetchCryptoBot(
    'getInvoices'
  )
  const foundInvoice = res.items.find(
    (inv) => inv.invoice_id === invoice_id
  )
  return foundInvoice
}

export const deleteInvoice = (invoice_id: number | string) => {
  const res = fetchCryptoBot('deleteInvoice', {
    method: 'POST',
    body: JSON.stringify({ invoice_id: invoice_id }),
  })
  console.log('удален')
  return res
}
