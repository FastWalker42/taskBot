import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import CONFIG from '../../CONFIG.json'
import botWebhook from './routes/botWebhook.js'
import subgram from './routes/subgram.js'
import balance from './routes/balance.js'
import slots from './routes/slots.js'

// Получаем ES-совместимые пути
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

const app = express()

// Обработка ошибок процесса
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
})

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Логирование запросов
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  )
  next()
})

// Статические файлы из папки public
app.use(express.static(path.join(rootDir, 'dist')))

// Маршруты API
app.use(botWebhook)
app.use(subgram)
app.use(balance)
app.use(slots)

// SPA роут (должен быть после API маршрутов)
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist/index.html'))
})

// Глобальный обработчик ошибок
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('🔥 Глобальная ошибка:', err)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
)

// Запуск сервера
app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${CONFIG.PORT}`)
})
