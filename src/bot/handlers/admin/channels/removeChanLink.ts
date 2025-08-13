import { Context } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import { removeOpChannelCustomLink } from '../../../../db/methods'
import editChan from './editChan'

export default async (ctx: Context) => {
  const channelId = parseCallBack(ctx.callbackQuery?.data!).data

  await removeOpChannelCustomLink(Number(channelId))
  await editChan(ctx)
}
