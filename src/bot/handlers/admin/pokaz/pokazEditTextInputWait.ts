import { Context, InlineKeyboard } from 'grammy'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'pokazEditTextInputWait')

  await ctx.reply(`Введи новый текст показа`, {
    reply_markup: new InlineKeyboard().text(
      '❌ Отменить',
      'pokazMenu'
    ),
  })
}
