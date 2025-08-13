import CONFIG from './CONFIG.json'
import { Bot, GrammyError, InlineKeyboard } from 'grammy'
import { parseMode } from '@grammyjs/parse-mode'
import * as fs from 'fs'

// Инициализация бота
const bot = new Bot(CONFIG.BOT_TOKEN_PROD)
bot.api.config.use(parseMode('HTML'))

// Читаем и парсим файл
const file = fs.readFileSync('./ids.txt', 'utf-8')
const ids = file
  .split(/\s+/)
  .filter(Boolean)
  .map((id) => Number(id))

console.log(`Total IDs: ${ids.length}`)

const CAPTION = `<b>❤️ Яндекс переведет до 400₽ на телефон КАЖДОМУ</b>, кто сделает его поиском по умолчанию и установит их приложение!

<b>Простой способ заработать:</b>
1. Переходим <a href="https://cpa.socialjet.link/FYkaQM">по ссылке</a> и выбираем Яндекс как свою основную поисковую систему <b>+200₽</b>, если у вас Android и <b>+300₽</b>, если у вас iPhone;
2. Устанавливаем приложение <a href="https://cpa.socialjet.link/niSOEa">Яндекс с Алисой</a> <b>+100₽</b>. <b>Чтобы получить бонус,</b> копируем <a href="https://cpa.socialjet.link/niSOEa">ссылку</a> и открываем в своем браузере.
<b>3. Получаем переводы в сумме до 400₽ на телефон в подарок!</b>
<blockquote>*При <a href="https://yandex.ru/project/ios/default_legal/legal_balance_300">выполнении</a> <a href="https://yandex.ru/project/searchapp/pp_promocodnica_landingi/100r_landing_yandexsearchapp-sj/rules?click_id=687669fdcda89e0001be735e">всех условий </a></blockquote>`

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
        bot.api.sendPhoto(id, 'https://i.ibb.co/pj03Xk45/image.png', {
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

sendMessages()
