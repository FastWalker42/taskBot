import { Context, InlineKeyboard } from 'grammy'
import { fetchUser } from '../../db/methods'
import { IMAGES } from '../../../CONFIG.json'

export const profileInfo = async (ctx: Context) => {
  const { id } = ctx.from!

  const user = await fetchUser({
    id: id,
  })

  const frozenStarsText =
    user?.frozen_balance!.length! > 0
      ? `${user?.frozen_balance.reduce(
          (sum, item) => sum + item.amount,
          0
        )} ⭐\n`
      : ''

  const refLink = `t.me/Vipstars_freebot?start=${id}`

  await ctx.replyWithPhoto(IMAGES.PROFILE, {
    caption: `<b>👤 ПРОФИЛЬ</b>
<pre><code class="language-Ваш 🆔">${user?.id}</code></pre>
<pre><code class="language-🤑 Баланс">${
      user?.balance.toFixed(2) ?? 0
    } ⭐</code></pre><pre><code class="language-⌛️ На удержании">${frozenStarsText}</code></pre>

<pre><code class="language-👔 Выполнено заданий"> ${
      user?.tasks_done
    }</code></pre>
<pre><code class="language-🤝 Рефералы"> ${
      user?.referals
    }</code></pre>
<pre><code class="language-🔗💕 Ваша реф.ссылка">${refLink}</code></pre>

<pre><code class="language-🚀 Усиление">⏳ Не включено</code></pre>`,

    reply_markup: new InlineKeyboard()
      .copyText('🔗 Скопировать реф.ссылку', refLink)
      .row()
      .text('📤 Вывод 💰', 'cashoutMenu')
      .text('💸 Пополнить 📥', 'topupMenu')
      .row()
      //.text('История ⏳', 'history').row()
      .text('Назад 📲', 'main_menu'),
  })
}
