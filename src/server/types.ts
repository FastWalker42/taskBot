import { SubscribeStatus } from "../api/subgram/types"

export interface SubgramNotify {
  webhooks: {
    webhook_id: number
    link: string
    user_id: number
    bot_id: number
    status: SubscribeStatus
    subscribe_date: string
  }[]
}

export enum SLOT_SYMBOLS {
  GRAPE = "grape",
  BAR = "bar",
  SEVEN = "seven",
  LEMON = "lemon",
}

export const PAYOUTS = [
  { symbol: SLOT_SYMBOLS.SEVEN, reward: 4 },
  { symbol: SLOT_SYMBOLS.BAR, reward: 3 },
  { symbol: SLOT_SYMBOLS.LEMON, reward: 2 },
  { symbol: SLOT_SYMBOLS.GRAPE, reward: 1 },
] as const

export const SLOTS = [
  SLOT_SYMBOLS.GRAPE,
  SLOT_SYMBOLS.BAR,
  SLOT_SYMBOLS.SEVEN,
  SLOT_SYMBOLS.LEMON,
] as const
