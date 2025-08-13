import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'makeAdsRefInputWait')

  await ctx.reply(`✏️ Введи имя для рекламной рефки:`, {
    reply_markup: new InlineKeyboard().text(
      '❌ Отменить',
      'adminMenu'
    ),
  })
}
