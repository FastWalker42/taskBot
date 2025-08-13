import { Context, InlineKeyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import {
  countChannelSubscribers,
  getOpChannel,
} from '../../../../db/methods'

export default async (ctx: Context) => {
  const channelId = parseCallBack(ctx.callbackQuery?.data!).data

  const chatData = await ctx.api.getChat(channelId)
  const subCount = await countChannelSubscribers(channelId)
  const opChannel = await getOpChannel(channelId)

  if (!opChannel) return

  const canCreateInvite = !!chatData.invite_link

  const infoMessage = `Канал <b>«${chatData.title}»</b>
<pre><code class="language-🌐 Всего переходов">${subCount}</code></pre>
<pre><code class="language-🔗 СПЕЦ ССЫЛКА">${
    opChannel.customLink
      ? `${opChannel.customLink}`
      : `Бот не использует специальную ссылку`
  }</code></pre>
${
  canCreateInvite
    ? '✅ Бот может создавать приглашения в канал.'
    : '⚠️ Бот НЕ МОЖЕТ создать ссылку-приглашение. Привяжите свою ссылку на этот канал 🔗'
}

Цена за задание: 
<blockquote><b>${opChannel.taskPrice} ⭐️</b></blockquote>`

  const keyboard = new InlineKeyboard()
    .text(
      `Режим: ${
        opChannel.enableCheck ? '✅ С ПРОВЕРКОЙ' : '☑️ БЕЗ ПРОВЕРКИ'
      } (переключить)`,
      `toggleChanChecking-${channelId}`
    )
    .row()
    .text(
      `Появление: ${
        opChannel.taskMode ? '👔 ЗАДАНИЯ' : '📚 ОП'
      } (переключить)`,
      `toggleOpChanTaskMode-${channelId}`
    )
    .row()
    .text(
      '⭐️ Изменить цену задания',
      `setChanPriceInputWait-${channelId}`
    )
    .row()
    .text(
      '🔗 Привязать спец.ссылку',
      `setChanLinkInputWait-${channelId}`
    )
    .row()
    .text('🚫 Убрать спец.ссылку', `removeChanLink-${channelId}`)
    .row()
    .text('❌ Убрать из ОП', `deleteChan-${channelId}`)
    .row()
    .text('🔙 Назад', 'adminMenu')

  await ctx.reply(infoMessage, {
    reply_markup: keyboard,
  })
}
