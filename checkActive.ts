import CONFIG from './CONFIG.json'
import { Bot } from 'grammy'
import * as fs from 'fs'

// Инициализация бота
const bot = new Bot(CONFIG.BOT_TOKEN_PROD)

// Читаем и парсим файл
const file = fs.readFileSync('./ids.txt', 'utf-8')
const ids = file
  .split(/\s+/)
  .filter(Boolean)
  .map((id) => Number(id))

console.log(`Total IDs to check: ${ids.length}`)

const CHUNK_SIZE = 20
const SLEEP_MS = 1

function chunk<T>(arr: T[], size: number): T[][] {
  const res = []
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function checkChunk(chunk: number[]) {
  const results = await Promise.allSettled(
    chunk.map((id) => bot.api.sendChatAction(id, 'typing'))
  )

  let active: number[] = []
  let blocked: number[] = []

  results.forEach((res, idx) => {
    const id = chunk[idx]
    if (res.status === 'fulfilled') {
      console.log(`✅ ACTIVE ${id}`)
      active.push(id)
    } else {
      const error = res.reason
      if (
        error?.description?.includes('bot was blocked by the user')
      ) {
        console.log(`❌ BLOCKED ${id}`)
        blocked.push(id)
      } else {
        console.warn(
          `⚠️ UNKNOWN ERROR ${id}:`,
          error?.description || error?.message
        )
      }
    }
  })

  return { active, blocked }
}

async function checkAll() {
  const chunks = chunk(ids, CHUNK_SIZE)
  const allActive: number[] = []
  const allBlocked: number[] = []

  for (const c of chunks) {
    const { active, blocked } = await checkChunk(c)
    allActive.push(...active)
    allBlocked.push(...blocked)
    await sleep(SLEEP_MS)
  }

  console.log(`\n=== ✅ DONE ===`)
  console.log(`Active: ${allActive.length}`)
  console.log(`Blocked: ${allBlocked.length}`)

  fs.writeFileSync('./active_ids.txt', allActive.join('\n'))
  fs.writeFileSync('./blocked_ids.txt', allBlocked.join('\n'))
}

checkAll()
