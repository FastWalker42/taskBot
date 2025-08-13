import { model, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CryptoBotInvoice } from '../api/cryptobot/types'
import { nanoid } from 'nanoid'
import { channel } from 'diagnostics_channel'

export interface UserInput {
  id: number
  ad_ref_name?: string
  invited_by?: number
}

interface FrozenBalance {
  amount: number
  until: Date
  channelId: number
}

interface IUser extends UserInput {
  ad_ref_list?: string[]
  tasks_done: number
  is_premium?: boolean
  last_activity: Date
  activated: boolean
  gender?: 'male' | 'female'
  subscribed: number[]
  state: string
  balance: number
  frozen_balance: FrozenBalance[]
  referals: number
  createdAt: Date
  appToken: string
  cashout_request?: {
    date: Date
    amount: number
  }
  topup_request?: CryptoBotInvoice
  is_admin?: boolean
  duelBet?: number
  duelMessageId?: number

  clicksCount: number
  last_mining?: Date
}

export const userSchema = new Schema<IUser>({
  id: { type: Number, required: true, unique: true },
  ad_ref_name: { type: String, required: false, default: undefined },
  invited_by: {
    type: Number,
    required: false,
    default: undefined,
  },
  ad_ref_list: {
    type: [String],
    required: false,
    default: [],
  },
  tasks_done: { type: Number, default: 0 },
  is_premium: { type: Boolean, required: false, default: false },
  last_activity: {
    type: Date,
    required: false,
    default: () => new Date(),
  },
  activated: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: false,
    default: undefined,
  },
  subscribed: {
    type: [Number],
    default: [],
  },
  state: { type: String, default: 'none' },
  balance: { type: Number, default: 0 },
  frozen_balance: [
    {
      amount: { type: Number, required: true },
      until: { type: Date, required: true },
      channelId: { type: Number, required: false },
    },
  ],
  referals: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  appToken: {
    type: String,
    required: true,
    default: () => uuidv4(),
  },
  cashout_request: {
    type: Object,
    required: false,
    default: undefined,
  },
  topup_request: {
    type: Object,
    required: false,
    default: undefined,
  },
  is_admin: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  duelBet: { type: Number, default: 0 },
  duelMessageId: { type: Number, default: undefined },

  clicksCount: { type: Number, default: 0 },
  last_mining: {
    type: Date,
    required: false,
    default: undefined,
  },
})

interface IOpChannel {
  id: number
  customLink?: string
  enableCheck: boolean
  taskMode: boolean
  taskPrice: number
}

export const opChannelSchema = new Schema<IOpChannel>({
  id: { type: Number, required: true, unique: true },
  customLink: { type: String, required: false },
  enableCheck: { type: Boolean, default: true },
  taskMode: { type: Boolean, default: false },
  taskPrice: { type: Number, default: 1 },
})

interface IOpSource {
  link: string
  taskMode?: boolean // Добавляем новое поле
  taskPrice?: number // Опционально можно добавить и цену задания
}

export const OpSourceSchema = new Schema<IOpSource>({
  link: { type: String, required: true, unique: true },
  taskMode: { type: Boolean, default: false }, // Добавляем в схему
  taskPrice: { type: Number, default: 1 }, // Добавляем в схему
})

interface IAdsRef {
  name: string
  payload: string
  visits: number
  unique_visits: number
  showOnlyUnique?: boolean
}

export const adsRefSchema = new Schema<IAdsRef>({
  name: { type: String, required: true, unique: true },
  payload: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(10),
  },
  visits: { type: Number, default: 0 },
  unique_visits: { type: Number, default: 0 },
  showOnlyUnique: { type: Boolean, default: false },
})

export const greetConfigSchema = new Schema({
  greetText: {
    type: String,
    required: true,
    default: 'Привет! Я бот :)',
  },
})

export const pokazConfigSchema = new Schema({
  pokazText: {
    type: String,
    required: true,
    default: 'Текст показа по умолчанию',
  },
  showedCount: {
    type: Number,
    default: 0,
  },
})
