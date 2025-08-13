import { LanguageCode } from 'grammy/types'
import CONFIG from '../../../CONFIG.json'
import {
  CheckMessagePayload,
  CompletedTasksResponse,
  GetMeResponse,
  GetTasksResponse,
} from './types'
const API_URL = 'https://api.flyerservice.io/'

export const flyerCheckMessage = async (
  user_id: number,
  language_code: string,
  message: CheckMessagePayload
): Promise<{
  skip: boolean
  error?: string
  warning?: string
  info?: string
}> => {
  const res = await fetch(`${API_URL}check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: CONFIG.FLYER.BOT_API_KEY,
      user_id,
      language_code,
      message,
    }),
  })

  return res.json()
}

export const flyerGetMe = async (): Promise<GetMeResponse> => {
  const res = await fetch(`${API_URL}get_me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: CONFIG.FLYER.BOT_API_KEY,
    }),
  })

  return res.json()
}

export const flyerGetTasks = async (
  user_id: number,
  language_code: string
): Promise<GetTasksResponse> => {
  const res = await fetch(`${API_URL}get_tasks`, {
    method: 'POST',
    body: JSON.stringify({
      key: CONFIG.FLYER.BOT_API_KEY,
      user_id: user_id,
      language_code: language_code,
      limit: 10,
    }),
  })
  return res.json()
}

export const checkTaskStatus = async (
  user_id: number,
  signature: string
) => {
  const res = await fetch(`${API_URL}check_task`, {
    method: 'POST',
    body: JSON.stringify({
      key: CONFIG.FLYER.WEB_APP_KEY,
      user_id: user_id,
      signature: signature,
    }),
  })
  return res.json()
}

export const flyerGetCompletedTasks = async (
  user_id: number
): Promise<CompletedTasksResponse> => {
  const res = await fetch(`${API_URL}get_completed_tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: CONFIG.FLYER.WEB_APP_KEY,
      user_id: user_id,
    }),
  })

  return res.json()
}

console.log(await flyerGetCompletedTasks(6273715396))
