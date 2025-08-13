import { Router } from 'express'
import { SubgramNotify } from '../types'
import { addFrozenBalance, incrementTaskDone } from '../../db/methods'
import CONFIG from '../../../CONFIG.json'
import bot from '../../bot'
import { asyncHandler } from '../asyncHandler'
import { STARS_PER_TASK } from '../../../CONFIG.json'

const router = Router()

router.post(
  '/subgram',
  asyncHandler(async (req, res) => {
    console.log('======= INCOMING REQUEST =======')
    console.log('Headers:', req.headers)
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Query params:', req.query)
    console.log('Body:', req.body)
    console.log('================================')

    res.sendStatus(200)
    try {
      const subgramData: SubgramNotify = req.body
      for (const webhook of subgramData.webhooks) {
        try {
          let msgText
          if (webhook.status === 'unsubscribed') {
            await addFrozenBalance(webhook.user_id, -STARS_PER_TASK)
            msgText = `⚠️ Вы отписались от спонсора ${webhook.link}
😔 Нам пришлось забрать звёзды назад.`
          } else if (webhook.status === 'subscribed') {
            await incrementTaskDone(webhook.user_id)
            await addFrozenBalance(webhook.user_id, STARS_PER_TASK)
            msgText = `⭐️❤️ Благодарим за подписку ${webhook.link}
🤑 Задание выполнено!
<blockquote>на счёт начислено ${STARS_PER_TASK}⭐️</blockquote>`
          } else {
            msgText = `⭐️😅 Подписка не засчитана, вы уже были в канале ${webhook.link}`
          }
          try {
            await bot.api.sendMessage(webhook.user_id, msgText)
          } catch {}
        } catch (error) {
          console.error('Ошибка обработки вебхука:', error)
        }
      }
    } catch {}
  })
)

export default router
