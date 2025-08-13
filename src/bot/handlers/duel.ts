import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'
import parseCallBack from '../utils/parseCallBack'
import { getDuelData } from '../../db/methods'

export default async (ctx: Context) => {
  const duelBet = parseCallBack(ctx.callbackQuery?.data!).data
  const userId = ctx.from?.id

  // Проверяем статус дуэли
  let inDuelSearch = false
  let currentBet = 0
  if (userId) {
    const duelData = await getDuelData(userId)
    inDuelSearch = duelData.inProgress
    currentBet = duelData.betAmount
  }

  // Если пользователь уже в поиске дуэли - показываем мини-интерфейс
  if (inDuelSearch) {
    const keyboard = new InlineKeyboard()
      .text('❌ ОТМЕНИТЬ ПОИСК', 'cancelDuel')
      .row()
      .text('Главное меню 📲', 'main_menu')

    await ctx.replyWithPhoto(IMAGES.DUEL, {
      caption: `<b>🎯 ВЫ УЖЕ ИЩЕТЕ СОПЕРНИКА!</b>
<blockquote>🕒 Ставка: <b>${currentBet}⭐️</b>
⌛ Ожидаем подходящего соперника...

❌ Вы можете отменить поиск в любой момент
</blockquote>`,
      reply_markup: keyboard,
    })
    return
  }

  // Обычное меню выбора ставки
  const bets = [1, 5, 10]
  const keyboard = new InlineKeyboard()

  // Заголовок
  keyboard.text('Выберите ставку:', 'duel').row()

  // Кнопки ставок
  for (let i = 0; i < bets.length; i += 3) {
    const row = bets.slice(i, i + 3)
    row.forEach((bet) => {
      const isSelected = String(bet) === duelBet
      const label = `⭐️${bet}${isSelected ? ' ✅' : ''}`
      keyboard.text(label, `duel-${bet}`)
    })
    keyboard.row()
  }

  // Кнопка поиска
  if (duelBet) {
    keyboard.text('🧨 ИСКАТЬ СОПЕРНИКА', `goDuel-${duelBet}`)
  } else {
    keyboard.text('🔸 ВЫБЕРИТЕ СТАВКУ 🔸', 'duel')
  }

  // Кнопка назад
  keyboard.row().text('Назад 📲', 'main_menu')

  await ctx.replyWithPhoto(IMAGES.DUEL, {
    caption: `<b>🎯 ДУЭЛЬ</b>
<blockquote>🤑 Выбираешь ставку — <b>ищешь соперника</b> ⭐

🔫 Один из игроков забирает ставку соперника, другой — <b>НИЧЕГО</b> 😈

🔰 Вы имеете равные шансы победить, 50 на 50.
</blockquote>
`,
    reply_markup: keyboard,
  })
}
