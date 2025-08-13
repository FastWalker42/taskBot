import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../../CONFIG.json'

export default async (ctx: Context) => {
  await ctx.replyWithPhoto(IMAGES.TOPUP, {
    caption: '💸 Выберите способ (валюту) пополнения:',
    reply_markup: new InlineKeyboard()
      .text('⭐️ STARS', 'starsTopUpInputWait-STARS')
      .row()
      .text('💎 Крипта', 'cryptoBotInputWait-TON')
      .row()
      .text('❌ Отменить', 'main_menu'),
  })
}
