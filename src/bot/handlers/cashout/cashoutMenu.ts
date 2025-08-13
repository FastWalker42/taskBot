import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../../CONFIG.json'
import { fetchUser } from '../../../db/methods'

export default async (ctx: Context) => {
  const user = await fetchUser({
    id: ctx.from!.id,
  })

  const frozenStarsText =
    user?.frozen_balance!.length! > 0
      ? `${user?.frozen_balance.reduce(
          (sum, item) => sum + item.amount,
          0
        )}`
      : ''

  await ctx.replyWithPhoto(IMAGES.CASHOUT, {
    caption: `⭐️ Вывод 💸
${
  user?.frozen_balance.length
    ? `<blockquote><b>⚠️ ВАШИ ЗВЁЗДЫ НА УДЕРЖАНИИ</b></blockquote>`
    : ''
}<pre><code class="language-⌛️ Звёзды на удержании">⭐️ ${frozenStarsText}</code></pre>
<pre><code class='language-🔥 Доступно к выводу'>⭐️ ${user?.balance.toFixed(
      2
    )}</code></pre>
`,
    reply_markup: new InlineKeyboard()
      .text('✅ На мой Telegram аккаунт 👤', 'starsCashoutMenu')
      .row()
      /*.text(
        '☑️ На другой счёт (внутри бота) 👥',
        'starsTransferInputWait'
      )
      .row()*/
      .text('Назад', 'profileInfo'),
  })
}
