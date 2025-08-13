import { Context, InlineKeyboard } from 'grammy'
import { updateState } from '../../../../db/methods'
import { IMAGES } from '../../../../../CONFIG.json'

export default async (ctx: Context) => {
  await updateState(ctx.from!.id, ctx.callbackQuery!.data!)

  const keyboard = new InlineKeyboard().text(
    '❌ Отменить',
    'main_menu'
  )

  await ctx.replyWithPhoto(IMAGES.TOPUP, {
    caption: `🔰 Введите сумму пополнения в STARS ⭐️`,
    reply_markup: keyboard,
  })
}
