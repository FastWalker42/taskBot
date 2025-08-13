import { Context } from 'grammy'
import { toggleOpChannelEnableCheck } from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import editChan from './editChan'

export default async (ctx: Context) => {
  const channelId = parseCallBack(ctx.callbackQuery?.data!).data

  await toggleOpChannelEnableCheck(Number(channelId))
  await editChan(ctx)
}
