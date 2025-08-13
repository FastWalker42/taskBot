import CONFIG from '../../../CONFIG.json'
import { Gender, OpList } from './types'

const IS_PROD_MODE = process.env.CONFIG_ENV === 'prod'
let TOKEN = CONFIG.BOT_TOKEN_TEST
if (IS_PROD_MODE) {
  TOKEN = CONFIG.BOT_TOKEN_PROD
}

const HEADERS = {
  'Content-type': 'application/json',
  Auth: CONFIG.SUBGRAM.API_KEY,
}

export const regSubgramBot = async () => {
  const response = await fetch('https://api.subgram.ru/add-new-bot', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      bot_token: TOKEN,
    }),
  })
  return response.json()
}

console.log(await regSubgramBot())

export const requestOpSubgram = async (
  id: number,
  is_premium: boolean,
  first_name: string,
  language_code: string = 'ru',
  gender?: Gender
): Promise<OpList> => {
  const response = await fetch('https://api.subgram.ru/request-op/', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      UserId: id,
      ChatId: id,
      Gender: gender,
      first_name: first_name,
      language_code: language_code,
      Premium: is_premium,
      MaxOP: 10,
      action: 'newtask',
    }),
  })

  return response.json()
}

export const checkUserSubscriptions = async (
  userId: number,
  links?: string[],
  startDate?: string,
  endDate?: string
): Promise<OpList> => {
  const body: Record<string, unknown> = {
    user_id: userId,
  }

  if (links) {
    body.links = links
  }
  if (startDate) {
    body['start_date'] = startDate
  }
  if (endDate) {
    body['end_date'] = endDate
  }

  const response = await fetch(
    'https://api.subgram.ru/get-user-subscriptions',
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    }
  )

  return await response.json()
}
