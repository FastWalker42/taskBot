import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'
import parseCallBack from '../utils/parseCallBack'
import { startDuelSearch } from '../../db/methods'
import bot from '../../bot'

export default async (ctx: Context) => {
  const amount = Number(parseCallBack(ctx.callbackQuery?.data!).data)
  if (!amount) return

  const waitingMsg = await ctx.replyWithPhoto(IMAGES.DUEL, {
    caption: `<b>🔫 ИЩЕМ СОПЕРНИКА...</b>
<blockquote>🕒 Ставка: <b>${amount}⭐️</b>
⌛ Ожидаем подходящего соперника...

❌ Вы можете отменить поиск в любой момент
</blockquote>`,
    reply_markup: new InlineKeyboard()
      .text('❌ ОТМЕНИТЬ ПОИСК', 'cancelDuel')
      .row()
      .text('Главное меню 📲', 'main_menu'),
  })

  try {
    const result = await startDuelSearch(
      ctx.from?.id!,
      amount,
      waitingMsg.message_id
    )

    if (result.status === 'duel_completed') {
      // Тексты сообщений
      const winnerText = `🎉 <b>ПОБЕДА!</b>
<blockquote>Вы забираете: <b>${(amount * 1.8).toFixed(
        1
      )}⭐️</b></blockquote>
Соперник 🆔 ${result.loserId} теряет свою ставку`

      const loserText = `😢 <b>ПОРАЖЕНИЕ</b>
<blockquote>Вы проиграли: <b>${amount}⭐️</b></blockquote>
Победитель 🆔 ${result.winnerId} забирает вашу ставку`

      // Функция для отправки результата дуэли
      const sendDuelResult = async (
        chatId: number | string,
        userId: number,
        text: string,
        isWinner: boolean
      ) => {
        try {
          // Пытаемся удалить старое сообщение
          await bot.api.deleteMessage(
            chatId,
            result.firstUserMessageId!
          )
        } catch (deleteError) {
          console.warn(`Не удалось удалить сообщение: ${deleteError}`)
        }

        await bot.api.sendPhoto(chatId, IMAGES.DUEL, {
          caption: text,
          reply_markup: new InlineKeyboard()
            .text(
              `♻️ Сыграть ещё раз (⭐️${amount})`,
              `goDuel-${amount}`
            )
            .row()
            .text('🤑 Поменять ставку', 'duel')
            .row()
            .text('📲 В главное меню', 'main_menu'),
          message_effect_id: isWinner
            ? '5046509860389126442'
            : undefined,
        })
      }

      // Для текущего пользователя
      const isCurrentUserWinner = ctx.from?.id === result.winnerId
      await sendDuelResult(
        ctx.chat?.id!,
        ctx.from?.id!,
        isCurrentUserWinner ? winnerText : loserText,
        isCurrentUserWinner
      )

      // Для соперника
      const isOpponentWinner = result.opponentId === result.winnerId
      await sendDuelResult(
        result.opponentId!,
        result.opponentId!,
        isOpponentWinner ? winnerText : loserText,
        isOpponentWinner
      )
    }
  } catch (error: any) {
    await ctx.api.editMessageCaption(
      ctx.chat?.id!,
      waitingMsg.message_id,
      {
        caption: `❌ Не удалось создать дуэль: 
<blockquote>${error.message}</blockquote>`,
        reply_markup: new InlineKeyboard()
          .text('🤑 Поменять ставку', 'duel')
          .row()
          .text('📲 В главное меню', 'main_menu'),
      }
    )
  }
}
