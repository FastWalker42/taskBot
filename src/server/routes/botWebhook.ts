import { Router } from 'express'
import bot from '../../bot'
import CONFIG from '../../../CONFIG.json'
import { asyncHandler } from '../asyncHandler'

const WEBHOOK_PATH = `/webhook/${CONFIG.BOT_TOKEN_PROD}`

async function setupWebhook() {
  try {
    await bot.api.setWebhook(`${CONFIG.HOST_URL}${WEBHOOK_PATH}`, {
      drop_pending_updates: true,
    })
    console.log('✅ Вебхук установлен!')
  } catch (error) {
    console.error('❌ Ошибка установки вебхука:', error)
  }
}
setupWebhook()

const router = Router()

router.post(
  WEBHOOK_PATH,
  asyncHandler(async (req, res) => {
    try {
      await bot.handleUpdate(req.body)
      res.sendStatus(200)
    } catch (error) {
      console.error('Ошибка обработки обновления:', error)
      res.sendStatus(500)
    }
  })
)

export default router
