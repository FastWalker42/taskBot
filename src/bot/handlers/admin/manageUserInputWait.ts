import { Context, InlineKeyboard } from 'grammy'
import { updateState } from '../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'manageUserInputWait')

  await ctx.reply('Введите 🆔 пользователя:', {
    reply_markup: new InlineKeyboard()
      .text('❌ Отменить', 'adminMenu')
      .row(),
  })
}
