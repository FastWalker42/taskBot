import { Context, InlineKeyboard } from 'grammy'
import { CryptoBotInvoice } from '../../../../api/cryptobot/types'

export default async (ctx: Context, invoice: CryptoBotInvoice) => {
  await ctx.reply(
    `💸 Запрос на пополнение:
<pre><code class="language-💵 К оплате">${invoice.amount} ${invoice.asset}</code></pre><pre><code class="language-🕒 Дата создания">${invoice.created_at}</code></pre>      
${invoice.bot_invoice_url}`,
    {
      reply_markup: new InlineKeyboard()
        .url('💎 Оплатить', invoice.bot_invoice_url)
        .row()
        .text('✅ Я оплатил', `checkCbInvoice-${invoice.invoice_id}`)
        .row()
        .text('❌ Отменить', `deleteCbInvoice-${invoice.invoice_id}`),
    }
  )
}
