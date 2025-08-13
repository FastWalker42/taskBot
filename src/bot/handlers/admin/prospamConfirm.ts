import { Context } from 'grammy'
import { User } from '../../../db/init'
import { GrammyError } from 'grammy'
import bot from '../../../bot'
import adminMenu from './adminMenu'

export default async (ctx: Context) => {
  const CHUNK_SIZE = 15
  const REPORT_EVERY = 10
  const MAX_RETRIES = 3
  const BASE_DELAY = 1000

  // Получаем только уникальные ID пользователей
  const userIds = await User.distinct('id').exec()

  if (userIds.length === 0) {
    await ctx.reply('В базе данных нет пользователей для рассылки.')
    return
  }

  let progressMessage = await ctx.reply(
    `⏳ Начинаю рассылку сообщения для ${userIds.length} пользователей...\n` +
      `Успешно: 0\n` +
      `Ошибок: 0\n` +
      `Прогресс: 0%`
  )

  let successCount = 0
  let errorCount = 0
  let processedChunks = 0
  let isSpamBlocked = false

  const safeSendToAdmin = async (text: string) => {
    try {
      await bot.api.sendMessage(ctx.from!.id, text)
    } catch (e) {
      console.error('Не удалось отправить сообщение админу:', e)
    }
  }

  const updateProgress = async () => {
    const progress = Math.round(
      ((successCount + errorCount) / userIds.length) * 100
    )
    try {
      await ctx.api.editMessageText(
        ctx.chat!.id,
        progressMessage.message_id,
        `${
          isSpamBlocked ? '⚠️ БОТ В СПАМ-БЛОКЕ ⚠️\n' : ''
        }⏳ Рассылка сообщения для ${
          userIds.length
        } пользователей...\n` +
          `Успешно: ${successCount}\n` +
          `Ошибок: ${errorCount}\n` +
          `Прогресс: ${progress}%`
      )
    } catch (e) {
      console.error('Ошибка при обновлении прогресса:', e)
    }
  }

  // ИСПРАВЛЕНИЕ: Используем copyMessage для сохранения оригинальной разметки
  const sendChunk = async (
    chunk: number[],
    attempt = 1
  ): Promise<{ chunkSuccess: number; chunkErrors: number }> => {
    try {
      const results = await Promise.allSettled(
        chunk.map((userId) => {
          // Копируем оригинальное сообщение со всеми его атрибутами
          /*return bot.api.copyMessage(
            ctx.from!.id,
            ctx.chat!.id,
            ctx.msg!.message_id
          )*/
          console.log(userId)
        })
      )

      const chunkSuccess = results.filter(
        (r) => r.status === 'fulfilled'
      ).length
      const chunkErrors = results.filter(
        (r) => r.status === 'rejected'
      ).length

      if (chunkSuccess > 0) {
        isSpamBlocked = false
      }

      return { chunkSuccess, chunkErrors }
    } catch (error) {
      console.error(`Ошибка в sendChunk (попытка ${attempt}):`, error)

      if (error instanceof GrammyError && error.error_code === 429) {
        isSpamBlocked = true
        const retryAfter = error.parameters?.retry_after || 30
        console.log(
          `Спам-блок обнаружен. Ожидание ${retryAfter} секунд...`
        )
        await safeSendToAdmin(
          `⚠️ Бот получил спам-блок! Ожидание ${retryAfter} секунд...`
        )

        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter + 5) * 1000)
        )

        if (attempt < MAX_RETRIES) {
          return sendChunk(chunk, attempt + 1)
        }
      }

      return { chunkSuccess: 0, chunkErrors: chunk.length }
    }
  }

  // Разбиваем ID пользователей на чанки
  const chunks: number[][] = []
  for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
    chunks.push(userIds.slice(i, i + CHUNK_SIZE))
  }

  for (const chunk of chunks) {
    let chunkSuccess = 0
    let chunkErrors = 0

    try {
      const result = await sendChunk(chunk)
      chunkSuccess = result.chunkSuccess
      chunkErrors = result.chunkErrors
    } catch (error) {
      console.error('Критическая ошибка в обработке чанка:', error)
      chunkErrors = chunk.length
    }

    successCount += chunkSuccess
    errorCount += chunkErrors
    processedChunks++

    if (processedChunks % REPORT_EVERY === 0 || isSpamBlocked) {
      await updateProgress()
    }

    const currentDelay = isSpamBlocked ? BASE_DELAY * 5 : BASE_DELAY
    await new Promise((resolve) => setTimeout(resolve, currentDelay))
  }

  try {
    await ctx.api.editMessageText(
      ctx.chat!.id,
      progressMessage.message_id,
      `✅ Рассылка завершена!\n` +
        `Всего пользователей: ${userIds.length}\n` +
        `Успешно: ${successCount}\n` +
        `Неуспешно: ${errorCount}\n` +
        `Процент успеха: ${Math.round(
          (successCount / userIds.length) * 100
        )}%`
    )
  } catch (e) {
    console.error('Ошибка при финальном обновлении:', e)
    await safeSendToAdmin(
      `Рассылка завершена!\n` +
        `Успешно: ${successCount}\n` +
        `Неуспешно: ${errorCount}`
    )
  }

  await adminMenu(ctx)
}
