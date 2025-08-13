import { Context, InlineKeyboard } from 'grammy'
import { updateState } from '../../../../db/methods'
import parseCallback from '../../../utils/parseCallBack'

import { CURRENCIES, CALLBACK_NAME } from './types'
import { IMAGES } from '../../../../../CONFIG.json'

export default async (ctx: Context) => {
  const selectedCoin = parseCallback(ctx.callbackQuery!.data!).data

  await updateState(ctx.from!.id, `${CALLBACK_NAME}-${selectedCoin}`)

  const keyboard = new InlineKeyboard()

  CURRENCIES.forEach((currency) => {
    const isSelected = currency === selectedCoin
    keyboard
      .text(
        isSelected ? `${currency} ✅` : currency,
        `${CALLBACK_NAME}-${currency}`
      )
      .row()
  })

  keyboard.text('❌ Отменить', 'main_menu')

  await ctx.replyWithPhoto(IMAGES.TOPUP, {
    caption: `🔰 Введите сумму пополнения. 
в ${selectedCoin}:`,

    reply_markup: keyboard,
  })
}
