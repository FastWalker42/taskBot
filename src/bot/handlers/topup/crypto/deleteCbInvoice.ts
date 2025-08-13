import { Context } from 'grammy'
import { deleteCryptoBotInvoice, fetchUser } from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import { deleteInvoice } from '../../../../api/cryptobot'
import start from '../../start'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const userData = await fetchUser({ id: id })
  const { action, data } = parseCallBack(ctx.callbackQuery!.data!)

  if (userData?.topup_request) {
    await deleteCryptoBotInvoice(id, data)
    await ctx.reply('✅ Запрос на пополнение отменён')
    await start(ctx)
  }
}
