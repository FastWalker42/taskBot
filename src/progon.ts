import mongoose from 'mongoose'
import { InlineKeyboard } from 'grammy'
import bot from './bot' // Убедись, что бот экспортируется из src/bot/index.ts
import { User } from './db/init'
import { ADMINS } from '../CONFIG.json'

// Подключение к MongoDB
const MONGO_URL = 'mongodb://127.0.0.1:27017/taskBot'

async function run() {
  try {
    await mongoose.connect(MONGO_URL)

    const users = await User.find({
      cashout_request: { $exists: true },
    })

    for (const user of users) {
      const { id, tasks_done, referals, cashout_request } = user

      // Получаем username через Telegram API
      let username = '(недоступен)'
      try {
        const tgUser = await bot.api.getChat(id)
        username = tgUser.username
          ? `@${tgUser.username}`
          : '(нет username)'
      } catch (err: any) {
        console.warn(
          `Не удалось получить username для ID ${id}:`,
          err.message
        )
      }

      // Получаем список приглашённых
      const invitedUsers = await User.find({ invited_by: id })
      const totalInvited = invitedUsers.length
      const newAccounts = invitedUsers.filter(
        (u) => u.id > 7500000000
      ).length
      const newPercent =
        totalInvited > 0
          ? ((newAccounts / totalInvited) * 100).toFixed(2)
          : '0.00'

      const text = `
📤 <b>Запрос на вывод</b>
🆔 <code>${id}</code>
👤 ${username}
💰 Сумма: ⭐ ${cashout_request?.amount}
✅ Выполнено заданий: ${tasks_done}
👥 Рефералов: ${referals}
🔗 Приглашено всего: ${totalInvited}
🧑‍🚀 Новореги (от 75...): ${newAccounts} (${newPercent}%)
      `.trim()

      const keyboard = new InlineKeyboard()
        .text('💸 СПИСАТЬ С БАЛАНСА', `confirmCashout-${id}`)
        .row()
        .text('❌ Отклонить заявку', `cancelCashout-${id}`)

      for (const adminId of ADMINS) {
        try {
          await bot.api.sendMessage(adminId, text, {
            parse_mode: 'HTML',
            reply_markup: keyboard,
          })
        } catch (err) {
          console.error(
            `Не удалось отправить админу ${adminId}:`,
            err
          )
        }
      }
    }

    console.log('✅ Все заявки отправлены администраторам.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при выполнении скрипта:', error)
    process.exit(1)
  }
}

run()
