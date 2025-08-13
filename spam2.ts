import CONFIG from './CONFIG.json'
import { Bot, GrammyError, InlineKeyboard } from 'grammy'
import { parseMode } from '@grammyjs/parse-mode'
import * as fs from 'fs'

// Инициализация бота
const bot = new Bot(CONFIG.BOT_TOKEN_PROD)
bot.api.config.use(parseMode('HTML'))

// Читаем и парсим файл
const file = fs.readFileSync('./ids2.txt', 'utf-8')
const ids = file
  .split(/\s+/)
  .filter(Boolean)
  .map((id) => Number(id))

console.log(`Total IDs: ${ids.length}`)

const CAPTION = `<b>Эксклюзивное предложение от 1XBET! </b>

💵 Зарегистрируйся с использованием промокода, пополняй счёт и получай свои <b>$800</b> от ведущего букмекера <b>1XBET</b>. 

💰 Промокод: <b>freebot</b>

👉 Переходи по ссылке: https://bit.ly/4553Gaa

✅ Пополняешь счёт, и забираешь <b>$800</b>

<b>🇵🇹🤩 "Бенфика" на пороге новой победы?</b>

На выезде "орлы" спокойно разобрались с "Ниццей", и теперь ждут гостей в Лиссабоне. Получится ли у французов сотворить чудо или португальцы снова устроят праздник для своих фанатов?

<b>Сделай свой прогноз и стань частью борьбы за Лигу чемпионов с 1xBet!</b>`

const CHUNK_SIZE = 15 // Количество одновременных запросов
const BOT_ADMIN_ID = 6273715396 // ID администратора для уведомлений

const successfulIds: number[] = [] // массив для успешных отправок

function chunk<T>(arr: T[], size: number): T[][] {
  const res = []
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

async function sendChunk(chunk: number[]) {
  try {
    const results = await Promise.allSettled(
      chunk.map((id) =>
        bot.api.sendPhoto(id, 'https://i.ibb.co/20T0cvLb/image.png', {
          caption: CAPTION,
        })
      )
    )

    results.forEach((result, i) => {
      const id = chunk[i]
      if (result.status === 'fulfilled') {
        console.log(`✅ Sent to ${id}`)
        successfulIds.push(id) // добавляем в массив
      } else {
        console.error(
          `❌ Failed for ${id}:`,
          (result.reason as any)?.message
        )
      }
    })

    return results.filter((r) => r.status === 'fulfilled').length
  } catch (error) {
    console.error('Error in sendChunk:', error)
    return 0
  }
}

async function sendAdminMessage(message: string) {
  try {
    await bot.api.sendMessage(BOT_ADMIN_ID, message)
  } catch (error) {
    console.error('Failed to send admin message:', error)
  }
}

async function sendMessages() {
  let success = 0
  const chunks = chunk(ids, CHUNK_SIZE)

  for (const c of chunks) {
    try {
      const count = await sendChunk(c)
      success += count
      console.log(`✅ Chunk done. Total success: ${success}`)
      await sendAdminMessage(
        `✅ Chunk done. Total success: ${success}`
      )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Too Many Requests')
      ) {
        const retryAfter =
          (error as GrammyError).parameters?.retry_after || 100
        const waitTime = retryAfter + 100

        console.log(
          `⏳ Rate limit hit. Waiting for ${
            waitTime / 1000
          } seconds...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))

        try {
          const count = await sendChunk(c)
          success += count
          console.log(
            `✅ Chunk done after retry. Total success: ${success}`
          )
          await sendAdminMessage(
            `✅ Chunk done after retry. Total success: ${success}`
          )
        } catch (retryError) {
          console.error('Retry failed:', retryError)
        }
      } else {
        console.error('Unexpected error:', error)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(`✅ Done. Total successful sends: ${success}`)
  await sendAdminMessage(
    `✅ Done. Total successful sends: ${success}`
  )

  // Сохраняем удачные ID в файл
  fs.writeFileSync(
    './successful_ids.txt',
    successfulIds.join('\n'),
    'utf-8'
  )
  console.log(
    `💾 Saved ${successfulIds.length} successful IDs to successful_ids.txt`
  )
}

setTimeout(() => {
  sendMessages().catch((err) => {
    console.error('Ошибка в sendMessages:', err)
    sendAdminMessage(`❌ Ошибка: ${err.message}`).catch(console.error)
  })
}, 2 * 60 * 60 * 1000)
