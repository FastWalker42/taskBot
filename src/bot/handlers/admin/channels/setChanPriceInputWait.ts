import { Context, InlineKeyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!

  try {
    const channelId = parseCallBack(ctx.callbackQuery?.data!).data
    const chatData = await ctx.api.getChat(channelId)

    await updateState(id, `setChanPriceInputWait-${channelId}`)

    await ctx.reply(
      `⭐️ Установите цену в звёздах для канала <b>«${chatData.title}»</b>`,
      {
        reply_markup: new InlineKeyboard().text(
          '❌ Отменить',
          'adminMenu'
        ),
      }
    )
  } catch {}
}
