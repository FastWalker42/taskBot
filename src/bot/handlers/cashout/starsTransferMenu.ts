import { Context, InlineKeyboard } from 'grammy'
import { fetchUser, updateState } from '../../../db/methods'

import { IMAGES } from '../../../../CONFIG.json'

export const starsTransferInputWaitId = async (ctx: Context) => {
  await updateState(ctx.from!.id, ctx.callbackQuery!.data!)

  const user = await fetchUser({ id: ctx.from!.id })

  const keyboard = new InlineKeyboard()

  keyboard.text('❌ Отменить', 'main_menu')

  await ctx.replyWithPhoto(IMAGES.TOPUP, {
    caption: `🔰 Введите 🆔 пользвателя которому нужно перевести звезды`,

    reply_markup: keyboard,
  })
}

export const starsTransferMenu = async (ctx: Context) => {
  await updateState(
    ctx.from!.id,
    `starsTransferInputWaitAmount-${ctx.message?.text}`
  )

  const user = await fetchUser({ id: ctx.from!.id })

  const keyboard = new InlineKeyboard()

  keyboard.text('❌ Отменить', 'main_menu')

  await ctx.replyWithPhoto(IMAGES.TOPUP, {
    caption: `🔰 Введите количество звёзд, которое хотите перевести`,

    reply_markup: keyboard,
  })
}
