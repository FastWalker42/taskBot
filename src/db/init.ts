import mongoose from 'mongoose'
import {
  adsRefSchema,
  greetConfigSchema,
  OpSourceSchema,
  opChannelSchema,
  userSchema,
  pokazConfigSchema,
} from './types'

try {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskBot')
} catch (error) {
  console.log(error)
}

export const User = mongoose.model('User', userSchema)
export const OpChannel = mongoose.model('OpChannel', opChannelSchema)
export const OpSource = mongoose.model('OpSource', OpSourceSchema)
export const AdsRef = mongoose.model('AdsRef', adsRefSchema)
export const GreetConfig = mongoose.model(
  'GreetConfig',
  greetConfigSchema
)
export const PokazConfig = mongoose.model(
  'PokazConfig',
  pokazConfigSchema
)
