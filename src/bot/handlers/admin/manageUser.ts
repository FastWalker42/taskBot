import { Context, InlineKeyboard } from 'grammy'
import { findUserById } from '../../../db/methods'

export default async (ctx: Context) => {
  try {
    // Получаем ID из сообщения или callback данных
    let targetId: number | null = null

    if (ctx.message?.text) {
      const text = ctx.message.text.trim()
      if (/^\d+$/.test(text)) {
        targetId = parseInt(text, 10)
      }
    } else if (ctx.callbackQuery?.data) {
      const data = ctx.callbackQuery.data
      const match = data.match(/\d+/)
      if (match) {
        targetId = parseInt(match[0], 10)
      }
    }

    if (!targetId || isNaN(targetId)) {
      throw new Error('Invalid ID')
    }

    console.log('Fetching user with ID:', targetId)

    const userData = await findUserById(targetId)
    if (!userData) {
      throw new Error('User not found')
    }

    const kb = new InlineKeyboard()
    if (userData.cashout_request) {
      kb.text('Подтвердить вывод', `confirmCashout-${targetId}`).row()
      kb.text('Отклонить вывод', `cancelCashout-${targetId}`).row()
    }

    kb.text('🔙 Назад', 'adminMenu')

    await ctx.reply(
      `Информация о пользователе:
<code>🆔 ${targetId}</code>
<blockquote>${
        userData.is_premium ? '🟪 ЕСТЬ ПРЕМИУМ' : '⬛️ Нет премиума'
      }</blockquote>

<pre><code class="language-🌐 пригласителя">${
        userData.invited_by ? userData.invited_by : '✖️ Нет'
      }</code></pre>

<blockquote>${
        userData.activated ? '✅ Прошёл ОПшку' : '❌ Не прошёл ОПшку'
      }</blockquote>
<pre><code class="language-🕒 Последняя активность">${
        userData.last_activity
      }</code></pre>
<pre><code class="language-📝 Заданий сделано">${
        userData.tasks_done
      }</code></pre>

<pre><code class="language-💰 Баланс">${userData.balance}</code></pre>
<pre><code class="language-🤝 Приглашено рефералов">${
        userData.referals
      }</code></pre>
<pre><code class="language-🕰 Дата регистрации">${
        userData.createdAt
      }</code></pre>
<pre><code class="language-😍 Пол"> ${
        userData.gender
          ? userData.gender === 'male'
            ? '🟦 МУЖСКОЙ'
            : '🟪 ЖЕНСКИЙ'
          : '⬛️ НЕ УКАЗАН'
      }</code></pre>

${
  userData.cashout_request
    ? `<b>ЗАПРОС НА ВЫВОД:</b>
<pre><code class="language-Сумма">${userData.cashout_request.amount}</code></pre>
<pre><code class="language-Дата">${userData.cashout_request?.date}</code></pre>`
    : '<b>ЗАПРОСА НА ВЫВОД НЕТ</b>'
}
`,
      { reply_markup: kb }
    )
  } catch (error) {
    console.error('Error in user info handler:', error)
    await ctx.reply('Неверный 🆔, либо пользователя нет в базе', {
      reply_markup: new InlineKeyboard().text(
        '🔙 Назад',
        'adminMenu'
      ),
    })
  }
}
