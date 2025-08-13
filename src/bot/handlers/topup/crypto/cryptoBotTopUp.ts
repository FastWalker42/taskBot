import { Context, InlineKeyboard } from 'grammy'
import parseCallback from '../../../utils/parseCallBack'
import { createCryptoBotInvoice, fetchUser } from '../../../../db/methods'
import { AvailableAssets } from '../../../../api/cryptobot/types'
import sendInvoice from './sendInvoice'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const userData = await fetchUser({ id: id })

  const { action, data } = parseCallback(userData?.state!)

  const selectedCoin = data
  const amount = Number(ctx.message?.text!.replace(/,/g, '.'))

  if (amount) {
    createCryptoBotInvoice(id, {
      amount: amount,
      currency_type: 'crypto',
      asset: selectedCoin as AvailableAssets,
    }).then(async (invoice) => {
      console.log(invoice)
      if (invoice) {
        await sendInvoice(ctx, invoice)
      }
    })
  } else {
    await ctx.reply('Введите корректное число!', {
      reply_markup: new InlineKeyboard().text('❌ Отменить', 'main_menu'),
    })
  }
}
