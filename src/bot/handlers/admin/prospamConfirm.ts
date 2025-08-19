// broadcast.ts
import { Context } from 'grammy'
import bot from '../../../bot'
import adminMenu from './adminMenu'
import { getAllUsers, removeUser } from '../../../db/methods'

const BASE_DELAY = 50
let isBroadcastRunning = false

export default async (ctx: Context) => {
  if (isBroadcastRunning) {
    await ctx.reply(
      '⚠️ Рассылка уже запущена. Подождите завершения текущей.'
    )
    return
  }

  isBroadcastRunning = true
  try {
    const userIds = await getAllUsers()

    if (!userIds.length) {
      await ctx.reply('В базе данных нет пользователей для рассылки.')
      return
    }

    let progressMessage = await ctx.reply(
      `⏳ Начинаю рассылку для ${userIds.length} пользователей...\n` +
        `Успешно: 0\n` +
        `Ошибок: 0\n` +
        `Прогресс: 0%`
    )

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < userIds.length; i++) {
      try {
        await bot.api.copyMessage(
          userIds[i],
          ctx.chat!.id,
          ctx.msg!.message_id,
          { reply_markup: ctx.msg!.reply_markup }
        )
        //await bot.api.sendChatAction(userIds[i], 'typing')
        successCount++
      } catch (e: any) {
        errorCount++

        // Если пользователь удалил бота или ID недействителен — удаляем его из базы
        if (
          e?.error_code === 403 || // Forbidden: bot was blocked by the user
          (e?.error_code === 400 &&
            /chat not found/i.test(e?.description || ''))
        ) {
          await removeUser(userIds[i])
        }

        if (e?.error_code === 429) {
          const retryAfter = e.parameters?.retry_after || 3
          await new Promise((res) =>
            setTimeout(res, (retryAfter + 1) * 1000)
          )
          i--
          continue
        }
      }

      if (i % 10 === 0 || i === userIds.length - 1) {
        const progress = Math.round(
          ((successCount + errorCount) / userIds.length) * 100
        )
        try {
          await ctx.api.editMessageText(
            ctx.chat!.id,
            progressMessage.message_id,
            `⏳ Рассылка для ${userIds.length} пользователей...\n` +
              `Успешно: ${successCount}\n` +
              `Ошибок: ${errorCount}\n` +
              `Прогресс: ${progress}%`
          )
        } catch {}
      }

      await new Promise((res) => setTimeout(res, BASE_DELAY))
    }

    await ctx.api.editMessageText(
      ctx.chat!.id,
      progressMessage.message_id,
      `✅ Рассылка завершена!\n` +
        `Всего: ${userIds.length}\n` +
        `Успешно: ${successCount}\n` +
        `Ошибок: ${errorCount}\n` +
        `Процент успеха: ${Math.round(
          (successCount / userIds.length) * 100
        )}%`
    )

    await adminMenu(ctx)
  } finally {
    isBroadcastRunning = false
  }
}
