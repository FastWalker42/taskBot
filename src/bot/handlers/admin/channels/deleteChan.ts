import { Context } from 'grammy'
import { deleteOpChannel } from '../../../../db/methods'
import adminMenu from '../adminMenu'
import parseCallBack from '../../../utils/parseCallBack'

export default async (ctx: Context) => {
  try {
    const channelId = parseCallBack(ctx.callbackQuery?.data!).data

    await deleteOpChannel(channelId)

    await ctx.reply('Канал удален из ОП ✅')

    await adminMenu(ctx)
  } catch (error) {
    console.log(error)
  }
}
