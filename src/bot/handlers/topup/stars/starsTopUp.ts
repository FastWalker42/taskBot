import { Context, InlineKeyboard } from 'grammy'
import { fetchUser, updateState } from '../../../../db/methods'
import parseCallback from '../../../utils/parseCallBack'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const user = await fetchUser({
    id: id,
  })

  const parsedState = parseCallback(user?.state!).data
  try {
    const amount = Number(ctx.message!.text)

    await ctx.replyWithInvoice(
      'STARS',
      'ПОПОЛНЕНИЕ БАЛАНСА',
      id.toString(),
      'XTR',
      [{ label: 'stars', amount: amount }]
    )
    await updateState(id, 'none')
  } catch (exception) {
    await ctx.replyWithPhoto(
      'https://i.ibb.co/RTC02Bcj/Design-Studio-2025-05-01-5.png',
      {
        caption: `Введите корректное число пополнения в <b>${parsedState}</b>`,
        reply_markup: new InlineKeyboard().text('❌ Отменить', 'main_menu'),
      }
    )
  }
}
