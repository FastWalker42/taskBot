import { Context, InlineKeyboard } from 'grammy'
import { fetchUser, updateState } from '../../../db/methods'

import { IMAGES } from '../../../../CONFIG.json'

export default async (ctx: Context) => {
  const keyboard = new InlineKeyboard()

  const user = await fetchUser({ id: ctx.from!.id })

  if (!user?.cashout_request) {
    const starValues = [50, 100, 250, 500, 1000, 2500, 10000, 50000]

    starValues.forEach((value, index) => {
      if (index % 2 === 0) keyboard.row()
      keyboard.text(`${value} ⭐️`, `starsCashout-${value}`)
    })

    keyboard.row().text('❌ Отменить', 'main_menu')

    await ctx.replyWithPhoto(IMAGES.TOPUP, {
      caption: `⭐️ Выберите сколько звёзд хотите вывести
<pre><code class='language-🔥 Доступно к выводу'>${user?.balance.toFixed(
        2
      )} ⭐️</code></pre>`,

      reply_markup: keyboard,
    })
  } else {
    await ctx.replyWithPhoto(IMAGES.TOPUP, {
      caption: `У вас уже есть заявка на вывод:
<pre><code class="language-Количество">⭐️${user.cashout_request.amount}</code></pre>
<pre><code class="language-Дата">🕒${user.cashout_request.date}</code></pre>

Дождитесь одобрения или обратитесь в поддержку.
`,

      reply_markup: keyboard,
    })
  }
}
