import { Context } from 'grammy'
import { updateBalanceByUserId } from '../../../../db/methods'

export default async (ctx: Context) => {
  console.log(JSON.stringify(ctx.message?.successful_payment!))

  const { total_amount, invoice_payload } = ctx.message?.successful_payment!

  await updateBalanceByUserId(Number(invoice_payload), Number(total_amount))
  await ctx.reply(`Успешное пополнение!
<pre><code class="language-Дата">🕒${new Date()}</code></pre>
<b>🚀 На баланс зачислено ${total_amount}⭐️</b>`)
}
