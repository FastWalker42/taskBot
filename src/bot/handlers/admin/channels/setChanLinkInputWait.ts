import { Context } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!

  try {
    const channelId = parseCallBack(ctx.callbackQuery?.data!).data
    const chatData = await ctx.api.getChat(channelId)

    await updateState(id, `setChanLinkInputWait-${channelId}`)

    await ctx.reply(
      `🔗 Отправьте пригласительную ссылку на канал <b>«${chatData.title}»</b>`
    )
  } catch {}
}
