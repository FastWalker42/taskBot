import { Context } from 'grammy'
import sendInvoice from './sendInvoice'
import {
  fetchUser,
  updateBalanceByUserId,
} from '../../../../db/methods'
import { cryptoBotCheckInvoice } from '../../../../api/cryptobot'
import parseCallBack from '../../../utils/parseCallBack'
import { STAR_TO_USD } from '../../../../../CONFIG.json'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const userData = await fetchUser({ id: id })
  const { action, data } = parseCallBack(ctx.callbackQuery!.data!)

  if (userData?.topup_request) {
    const currentInvoice = await cryptoBotCheckInvoice(Number(data))

    if (currentInvoice?.status !== 'paid') {
      await sendInvoice(ctx, userData.topup_request)
    } else {
      const topupAmount =
        (currentInvoice.amount *
          Number(currentInvoice.paid_usd_rate)) /
        STAR_TO_USD
      await updateBalanceByUserId(id, topupAmount)
      await ctx.reply(`Оплачено! 
<pre><code class="language-Начислено">${topupAmount}⭐️</code></pre>
`)
    }
  }
}
