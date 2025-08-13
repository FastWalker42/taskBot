import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'
import {
  updateBalanceByUserId,
  getBalanceByUserId,
} from '../../db/methods'

const BET_AMOUNT = 5 // Ставка 5⭐️

export default async (ctx: Context) => {
  const userId = ctx.from?.id
  if (!userId) return

  // Проверяем баланс пользователя
  const currentBalance = await getBalanceByUserId(userId)
  if (currentBalance === null) {
    await ctx.reply('Ошибка при проверке баланса')
    return
  }

  if (currentBalance < BET_AMOUNT) {
    // Если не хватает средств - показываем сообщение с картинкой
    await ctx.replyWithPhoto(IMAGES.CUBEGAME, {
      caption: `❌ Не хватает средств! Нужно ${BET_AMOUNT}⭐️\nВаш баланс: ${currentBalance}⭐️`,
      reply_markup: new InlineKeyboard()
        .text('Пополнить баланс 💰', 'topup_balance')
        .text('Назад 📲', 'main_menu'),
      message_effect_id: '5104841245755180586',
    })
    return
  }

  // Списываем ставку
  const newBalance = await updateBalanceByUserId(userId, -BET_AMOUNT)
  if (newBalance === null) {
    await ctx.reply('Ошибка при списании средств')
    return
  }

  // Отправляем анимацию кубика
  const diceMessage = await ctx.replyWithDice('🎲')

  // Получаем результат броска (1-6)
  const diceResult = diceMessage.dice?.value
  if (!diceResult || diceResult < 1 || diceResult > 6) {
    await ctx.reply('Произошла ошибка при броске кубика')
    return
  }

  // Ждем 2 секунды для завершения анимации
  await new Promise((resolve) => setTimeout(resolve, 2000))

  let winAmount = 0
  let resultMessage = ''

  // Определяем выигрыш по результату
  switch (diceResult) {
    case 1:
      winAmount = 1
      resultMessage = 'Выпала 1️⃣ - возвращаем 1⭐️'
      break
    case 2:
      winAmount = 2
      resultMessage = 'Выпала 2️⃣ - получаете 2⭐️'
      break
    case 3:
      winAmount = 3
      resultMessage = 'Выпала 3️⃣ - получаете 3⭐️'
      break
    case 4:
      winAmount = 4
      resultMessage = 'Выпала 4️⃣ - получаете 4⭐️'
      break
    case 5:
      winAmount = BET_AMOUNT // Возвращаем ставку
      resultMessage = 'Выпала 5️⃣ - возвращаем вашу ставку 5⭐️'
      break
    case 6:
      winAmount = BET_AMOUNT * 2 // Двойной выигрыш
      resultMessage = '🎉 Выпала 6️⃣ - ВЫИГРЫШ 10⭐️! 🎉'
      break
  }

  // Начисляем выигрыш
  const finalBalance = await updateBalanceByUserId(userId, winAmount)
  if (finalBalance === null) {
    await ctx.reply('Ошибка при начислении выигрыша')
    return
  }

  // Формируем сообщение с результатом
  const message = `🎲 Результат броска:
<blockquote>${resultMessage}</blockquote>
<blockquote>Ваш баланс: ${finalBalance}⭐️</blockquote>`

  // Отправляем результат с картинкой
  await ctx.replyWithPhoto(IMAGES.CUBEGAME, {
    caption: message,
    reply_markup: new InlineKeyboard()
      .text('Сыграть ещё (5⭐️)', 'playCube')
      .text('Назад 📲', 'main_menu'),
  })
}
