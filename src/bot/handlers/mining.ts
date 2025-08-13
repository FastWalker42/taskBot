import { Context, InlineKeyboard } from 'grammy'
import { fetchUser, doMining } from '../../db/methods'
import { IMAGES } from '../../../CONFIG.json'
import parseCallBack from '../utils/parseCallBack'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const { data: isClicked } = parseCallBack(ctx.callbackQuery?.data!)

  let user = await fetchUser({ id })
  let miningMessage = ''
  let minedAmount = 0

  // Проверяем доступность майнинга
  const now = new Date()
  const lastMiningTime = user?.last_mining
    ? new Date(user.last_mining)
    : null
  const nextMiningTime = lastMiningTime
    ? new Date(lastMiningTime.getTime() + 3 * 60 * 60 * 1000)
    : now

  // Вычисляем оставшееся время
  let timeLeft = 'сейчас'
  let isMiningAvailable = false

  if (nextMiningTime > now) {
    const diffMs = nextMiningTime.getTime() - now.getTime()
    const diffMins = Math.ceil(diffMs / (1000 * 60))

    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      timeLeft = `${hours}ч ${mins}м`
    } else {
      timeLeft = `${diffMins} минут`
    }
  } else {
    isMiningAvailable = true
  }

  // Если нажата кнопка и майнинг доступен - выполняем майнинг
  if (isClicked === 'clicked' && isMiningAvailable) {
    minedAmount = await doMining(id)

    if (minedAmount > 0) {
      miningMessage = `⛏️ Вы успешно добыли ${minedAmount}⭐!`
      // Обновляем данные пользователя после майнинга
      user = await fetchUser({ id })
    }
  }

  // Формируем сообщение о доступности
  if (minedAmount === 0) {
    miningMessage = isMiningAvailable
      ? `💎 Майнинг <b>ДОСТУПЕН СЕЙЧАС</b>! 
Нажмите "Майнить" ⭐️‼️`
      : `⏳ Следующая добыча через ${timeLeft}`
  }

  // Редактируем сообщение если это callback
  if (ctx.callbackQuery) {
    try {
      await ctx.editMessageMedia(
        {
          type: 'photo',
          media: IMAGES.MINING,
          caption: `<b>⛏️ МАЙНИНГ</b>
<pre><code class="language-🤑 Ваш баланс">${
            user?.balance.toFixed(2) ?? 0
          } ⭐</code></pre>
<blockquote>${miningMessage}</blockquote>`,
          parse_mode: 'HTML',
        },
        {
          reply_markup: new InlineKeyboard()
            .text('⛏️ Майнить 🤩', 'mining-clicked')
            .row()
            .text('Назад 📲', 'main_menu'),
        }
      )
      return
    } catch (e) {
      console.error('Error editing message:', e)
    }
  }

  // Отправляем новое сообщение если это не callback
  await ctx.replyWithPhoto(IMAGES.MINING, {
    caption: `<b>⛏️ МАЙНИНГ</b>
<pre><code class="language-🤑 Ваш баланс">${
      user?.balance.toFixed(2) ?? 0
    } ⭐</code></pre>
<blockquote>${miningMessage}</blockquote>`,
    reply_markup: new InlineKeyboard()
      .text('⛏️ Майнить 🤩', 'mining-clicked')
      .row()
      .text('Назад 📲', 'main_menu'),
    parse_mode: 'HTML',
  })
}
