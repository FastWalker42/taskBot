import { Context, InlineKeyboard } from 'grammy'
import {
  getAllOpSources,
  getAllOpChannels,
} from '../../../db/methods'

export default async (ctx: Context) => {
  const opChannels = await getAllOpChannels()
  const opSources = await getAllOpSources()

  // Собираем все кнопки вместе
  const buttons: { text: string; callback_data: string }[] = []

  for (let i = 0; i < opChannels.length; i++) {
    const channel = opChannels[i]
    try {
      const chatData = await ctx.api.getChat(channel.id)
      const name = chatData.title ?? `Канал (${i + 1})`
      buttons.push({
        text: name,
        callback_data: `editChan-${channel.id}`,
      })
    } catch {
      // Логирование ошибок если нужно
    }
  }

  for (let i = 0; i < opSources.length; i++) {
    const opSource = opSources[i]
    const name = `Ссылка ${i + 1}`
    buttons.push({
      text: name,
      callback_data: `editOpSource-${opSource._id}`, // ✅ используем id
    })
  }

  const kb = new InlineKeyboard()

  buttons.forEach((btn, idx) => {
    kb.text(btn.text, btn.callback_data)
    if ((idx + 1) % 2 === 0) {
      kb.row()
    }
  })

  if (buttons.length % 2 !== 0) {
    kb.row()
  }

  kb.text('🔙 Назад', 'adminMenu')

  await ctx.reply('<b>👑 Управление ОП</b>', {
    reply_markup: kb,
  })
}
