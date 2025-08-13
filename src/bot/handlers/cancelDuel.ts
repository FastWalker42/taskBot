import { Context } from 'grammy'
import { cancelDuelSearch } from '../../db/methods'
import { IMAGES } from '../../../CONFIG.json'
import { InlineKeyboard } from 'grammy'

export default async (ctx: Context) => {
  try {
    const userId = ctx.from?.id
    if (!userId) return

    const result = await cancelDuelSearch(userId)
    if (result) {
      await ctx.replyWithPhoto(IMAGES.DUEL, {
        caption:
          '✅ Поиск отменён!\nВаши средства возвращены на баланс',
        reply_markup: new InlineKeyboard()
          .text('🎯 Начать новую дуэль', 'duel')
          .row()
          .text('📲 В главное меню', 'main_menu'),
      })
    } else {
      await ctx.reply('❌ У вас нет активных дуэлей для отмены')
    }
  } catch (error: any) {
    await ctx.reply(`❌ Ошибка при отмене дуэли: ${error.message}`)
  }
}
