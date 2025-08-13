import { Context } from 'grammy'
import {
  getOpChannel,
  fetchUser,
  addOpChannel,
} from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const userExisted = await fetchUser({
    id: id,
  })

  const chat_id = ctx.message?.chat_shared?.chat_id!

  try {
    const chatData = await ctx.api.getChat(chat_id)

    const opChannel = await getOpChannel(chat_id)
    if (opChannel) {
      await ctx.reply('Канал уже есть!')
    } else {
      chatData.username || chatData.invite_link
        ? addOpChannel(chat_id)
        : console.log('Не удалось')

      await ctx.reply(`
${
  chatData.type === 'channel'
    ? 'Добавление группы'
    : 'Добавление канала'
} <b>«${chatData.title}»</b> на ОП ${
        chatData.username ? `\n@${chatData.username}` : ''
      }
<pre><code class="language-🆔 канала/чата">${chat_id}</code></pre>
${chatData.username ? `@${chatData.username}` : '🔑 Приватный канал'}
${
  !chatData.username && !chatData.invite_link
    ? `<blockquote><b>⚠️ БОТ НЕ МОЖЕТ ПРИГЛАШАТЬ ЛЮДЕЙ. 
ВЫДАЙТЕ ПРАВА В КАНАЛЕ И ПОПРОБУЙТЕ СНОВА</b></blockquote>`
    : '<blockquote>🤖 У бота есть необходимые права ✅</blockquote>'
}
${
  chatData.username || chatData.invite_link
    ? '✅ КАНАЛ ДОБАВЛЕН'
    : '❌ НЕ УДАЛОСЬ ДОБАВИТЬ КАНАЛ'
}`)
    }
  } catch {
    await ctx.reply(
      '❌ Не удалось получить доступ к каналу/чату. Бот не состоит там'
    )
  }
  if (userExisted?.is_admin) {
    await adminMenu(ctx)
  }
}
