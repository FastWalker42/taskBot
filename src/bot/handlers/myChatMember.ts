import { Context, InlineKeyboard } from 'grammy'
import { ADMINS } from '../../../CONFIG.json'

export default async (ctx: Context) => {
  const memberUpdate = ctx.myChatMember

  if (
    memberUpdate &&
    memberUpdate.new_chat_member.status === 'administrator' && // стал админом
    ['left', 'kicked', 'member'].includes(
      memberUpdate.old_chat_member.status
    ) // раньше не был админом
  ) {
    console.log('[INFO] Бот добавлен в канал:')
    console.log(JSON.stringify(memberUpdate, null, 2))

    const channelId = memberUpdate.chat.id
    const title = memberUpdate.chat.title || 'неизвестно'

    for (const adminId of ADMINS) {
      try {
        await ctx.api.sendMessage(
          adminId,
          `🔔 Бота добавили в канал: ${title}\n<pre><code class="language-plain">ID: ${channelId}</code></pre>`,
          {
            reply_markup: new InlineKeyboard()
              .text('📌 Поставить на ОП', `addChan-${channelId}`)
              .row()
              .text(
                '📝 Поставить в ЗАДАНИЯ',
                `addChan-task-${channelId}`
              ),
            parse_mode: 'HTML',
          }
        )
      } catch (error) {
        console.error(
          `Не удалось отправить сообщение админу ${adminId}:`,
          error
        )
      }
    }
  } else {
    console.log('[DEBUG] Обновление my_chat_member проигнорировано')
  }
}
