import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { getUsersSummary } from '../../../db/methods'

export default async (ctx: Context) => {
  const summary = await getUsersSummary()
  await ctx.reply(
    `<b>👑 Статистика бота</b>
<pre><code class="language-👥 Всего юзеров">${summary.usersCount}</code></pre>
<pre><code class="language-💎 Премиум юзеров">${summary.premiumUsers}</code></pre>
<pre><code class="language-📊 Активных (за неделю)">${summary.activeLastWeek}</code></pre>

<pre><code class="language-🟦 Мужской пол">${summary.maleGender}</code></pre>
<pre><code class="language-🟪 Женский пол">${summary.femaleGender}</code></pre>
<pre><code class="language-❓ Пол не указан">${summary.noGender}</code></pre>`,

    {
      reply_markup: new InlineKeyboard().text(
        '🔙 Назад',
        'adminMenu'
      ),
    }
  )
}
