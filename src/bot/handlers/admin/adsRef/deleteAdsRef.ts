import { Context } from 'grammy'
import { deleteAdRef } from '../../../../db/methods'
import adminMenu from '../adminMenu'
import parseCallBack from '../../../utils/parseCallBack'

export default async (ctx: Context) => {
  const adsRefPayload = parseCallBack(ctx.callbackQuery?.data!).data
  await deleteAdRef(adsRefPayload)
  await ctx.reply('Рефка удалена ✅')

  await adminMenu(ctx)
}
