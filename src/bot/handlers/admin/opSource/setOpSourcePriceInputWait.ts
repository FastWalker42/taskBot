import { Context, InlineKeyboard } from 'grammy'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!

  try {
    await updateState(id, ctx.callbackQuery?.data!)

    await ctx.reply(`Введите новую цену в звёздах:`, {
      reply_markup: new InlineKeyboard().text(
        '❌ Отменить',
        'adminMenu'
      ),
    })
  } catch {}
}
