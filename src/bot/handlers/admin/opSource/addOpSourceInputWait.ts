import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { fetchUser, updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const userExisted = await fetchUser({
    id: id,
  })
  if (userExisted?.is_admin) {
    await updateState(id, ctx.callbackQuery?.data!)
    await ctx.reply(
      `Отправь ссылку на ресурс ОП 
(<code>https://t.me/юз</code> или <code>t./me/юз</code>)`,
      {
        reply_markup: new InlineKeyboard().text(
          '❌ Отменить',
          'main_menu'
        ),
      }
    )
  }
}
