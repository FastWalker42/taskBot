import { Bot } from 'grammy'

import preCheckoutHandler from './topup/stars/preCheckout'
import successHandler from './topup/stars/success'

import start from './start'
import { profileInfo } from './profile'
import text from './text'
import callback from './callback'
import chatShared from './admin/channels/chatShared'

import myChatMember from './myChatMember'

export default (bot: Bot) => {
  bot.catch(({ error }) => {
    console.error('Global Bot Error:', error)
  })

  bot.command('start', start)

  bot.on('my_chat_member', myChatMember)
  bot.command('profile', profileInfo)

  // bot.on('msg:forward_origin', msgShared)

  bot.on('message:text', text)
  bot.on('message:caption', text)

  bot.on('callback_query:data', callback)

  bot.on('pre_checkout_query', preCheckoutHandler)
  bot.on('message:successful_payment', successHandler)
  bot.on(':chat_shared', chatShared)
}
