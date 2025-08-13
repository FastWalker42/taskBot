import { Context } from 'grammy'
import { toggleOpChannelTaskMode } from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import editChan from './editChan'

export default async (ctx: Context) => {
  const channelId = parseCallBack(ctx.callbackQuery?.data!).data

  await toggleOpChannelTaskMode(Number(channelId))
  await editChan(ctx)
}
