import { Context, InlineKeyboard, Keyboard } from 'grammy'
import {
  getAllOpChannels,
  getAllOpSources,
  updateState,
} from '../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'prospamInputWait')

  await ctx.reply(
    `<b>📤 Меню рассылок</b>
Отправь сюда сообщение для рассылки
`,
    {
      reply_markup: new InlineKeyboard()
        .text('❌ Отменить', 'adminMenu')
        .row(),
    }
  )
}
