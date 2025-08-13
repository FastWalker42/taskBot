import { Context } from 'grammy'
import { ADMINS } from '../../../../../CONFIG.json'
import {
  confirmCashoutRequest,
  findUserById,
} from '../../../../db/methods'

export default async (ctx: Context) => {
  try {
    const callbackData = ctx.callbackQuery?.data

    if (
      !callbackData ||
      !callbackData.startsWith('confirmCashout-')
    ) {
      console.error('Invalid callback format received:', callbackData)
      await ctx.reply('Неверный формат запроса')
      return
    }

    // Разбираем формат: confirmCashout-8038093257
    const targetUserId = Number(callbackData.split('-')[1])

    if (isNaN(targetUserId)) {
      console.error('Invalid user ID:', callbackData)
      await ctx.reply('Некорректный ID пользователя')
      return
    }

    // Получаем данные пользователя для суммы вывода
    const user = await findUserById(targetUserId)
    if (!user?.cashout_request) {
      await ctx.reply('Заявка на вывод не найдена')
      return
    }

    const amount = user.cashout_request.amount

    // Подтверждаем вывод
    const success = await confirmCashoutRequest(targetUserId)

    if (success) {
      // Уведомление админов
      for (const admin of ADMINS) {
        try {
          await ctx.api.sendMessage(
            admin,
            `✅ Подтвержден вывод ${amount}⭐ от ${targetUserId}`
          )
        } catch {}
      }
    } else {
      await ctx.reply('❌ Ошибка при обработке заявки')
    }

    await ctx.answerCallbackQuery()
  } catch (error) {
    console.error('Cashout processing failed:', error)
    await ctx.reply('Ошибка сервера при обработке')
  }
}
