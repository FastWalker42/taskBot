import { Context } from 'grammy'
import { ADMINS } from '../../../../../CONFIG.json'
import { cancelCashoutRequest } from '../../../../db/methods'

export default async (ctx: Context) => {
  try {
    const callbackData = ctx.callbackQuery?.data

    if (!callbackData || !callbackData.startsWith('cancelCashout-')) {
      console.error('Invalid callback format received:', callbackData)
      await ctx.reply('Неверный формат запроса отмены')
      return
    }

    // Разбираем формат: cancelCashout-8038093257
    const parts = callbackData.split('-')
    if (parts.length !== 2) {
      console.error('Malformed cancel callback:', callbackData)
      await ctx.reply('Ошибка в параметрах отмены')
      return
    }

    const [, targetUserIdStr] = parts
    const targetUserId = Number(targetUserIdStr)

    if (isNaN(targetUserId)) {
      console.error('Invalid user ID:', targetUserIdStr)
      await ctx.reply('Некорректный ID пользователя')
      return
    }

    // Основная логика отмены
    const success = await cancelCashoutRequest(targetUserId)

    if (success) {
      for (const admin of ADMINS) {
        try {
          await ctx.api.sendMessage(
            admin,
            `❌ Отменён вывод средств для ${targetUserId}`
          )
        } catch {}
      }
    } else {
      await ctx.reply('⚠️ Не удалось отменить заявку')
    }

    await ctx.answerCallbackQuery()
  } catch (error) {
    console.error('Cancel cashout failed:', error)
    await ctx.reply('Ошибка при отмене заявки')
  }
}
