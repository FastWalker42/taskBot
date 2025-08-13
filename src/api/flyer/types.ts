export interface CheckMessagePayload {
  text: string
  button_bot: string
  button_channel: string
  button_url: string
}

interface Task {
  signature: string
  task: string
  price: 0
  link: string
  links: string[]
  photo: string
  name: string
  status: string
}

export interface GetMeResponse {
  type: string
  bot_id: number
  status: boolean
  error?: string
}

export interface GetTasksResponse {
  result: Task[]
  error?: string
}

export interface CompletedTasksResponse {
  result: {
    completed_tasks: any[] // Можно уточнить тип позже
    count_all_tasks: number
  }
  error?: string
}
