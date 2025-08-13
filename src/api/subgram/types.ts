export type Gender = 'male' | 'female'

export type SubscribeStatus =
  | 'subscribed'
  | 'unsubscribed'
  | 'notgetted'

type Sponsor = {
  link: string
  status: SubscribeStatus
  type: 'channel' | 'bot' | 'resourse'
  resource_logo?: string
  resource_name?: string
}

export type OpList = {
  status: 'warning' | 'ok' | 'gender'
  code: 200 | 404 | 400 | 500
  message: string
  links?: string[]
  additional?: {
    sponsors: Sponsor[]
  }
  total_fixed_link: number
}
