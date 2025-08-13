import {
  GetTraffyTasksResponse,
  CheckTraffyTaskResponse,
} from './types'

import { TRAFFY } from '../../../CONFIG.json'

const BASE_URL = 'https://api.traffy.site/v1/mixer/bot'

export async function getTraffyTasks(
  telegramChatId: number | string
): Promise<GetTraffyTasksResponse> {
  const url = new URL(`${BASE_URL}/pick_tasks`)
  url.searchParams.append('resource_id', TRAFFY.API_KEY)
  url.searchParams.append('telegram_id', telegramChatId.toString())
  url.searchParams.append('max_tasks', '3')

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`)
  }

  const data = (await response.json()) as GetTraffyTasksResponse
  return data
}

export async function checkSubscriptionTraffy(
  resourceId: string,
  telegramChatId: string,
  taskId: string
): Promise<CheckTraffyTaskResponse> {
  const url = new URL(`${BASE_URL}/check_completion`)
  url.searchParams.append('resource_id', resourceId)
  url.searchParams.append('telegram_id', telegramChatId)
  url.searchParams.append('task_id', taskId)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(
      `Failed to check subscription: ${response.statusText}`
    )
  }

  const data = (await response.json()) as CheckTraffyTaskResponse
  return data
}
