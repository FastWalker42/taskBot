import { Context, InlineKeyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import {
  fetchUser,
  setOpChannelCustomLink,
  updateState,
} from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const user = await fetchUser({
    id: id,
  })

  const channelId = Number(parseCallBack(user?.state!).data)

  const text = ctx.message?.text ?? 'none'

  const isValidLink =
    text.startsWith('https://t.me') || text.startsWith('t.me/')

  if (isValidLink) {
    await setOpChannelCustomLink(channelId, text)
    await ctx.reply(`🔗✅ Ссылка для канала ${text} добавлена!`)
    await adminMenu(ctx)
  } else {
    await ctx.reply('⚠️ Неверная ссылка', {
      reply_markup: new InlineKeyboard().text(
        '❌ Отменить',
        'main_menu'
      ),
    })
  }
}
