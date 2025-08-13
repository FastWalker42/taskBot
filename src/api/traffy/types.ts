export type TraffyTask = {
  id: string
  title: string
  link: string
  image_url: string
}

export type GetTraffyTasksResponse = {
  success: true
  message: string
  tasks: TraffyTask[]
}

export type CheckTraffyTaskResponse =
  | {
      is_completed: false
      token: null
    }
  | {
      is_completed: true
      token: string
    }
