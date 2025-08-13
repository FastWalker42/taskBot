import { Context } from 'grammy'
import {
  fetchUser,
  updateBalanceByUserId,
  updateState,
} from '../../../db/methods'
import parseCallback from '../../utils/parseCallBack'

export default async (ctx: Context) => {
  const senderId = ctx.from!.id
  const sender = await fetchUser({ id: senderId })

  const recipientId = Number(parseCallback(sender?.state!).data)
  const amount = Number(ctx.message?.text)

  if (!recipientId || isNaN(amount) || amount <= 0) {
    return ctx.reply(
      '❌ Неверные данные. Убедитесь, что вы ввели ID и корректное количество звёзд.'
    )
  }

  // Проверка существования получателя
  const recipient = await fetchUser({ id: recipientId })
  if (!recipient) {
    return ctx.reply('❌ Получатель с указанным ID не найден.')
  }

  // Проверка баланса
  if ((sender?.balance ?? 0) < amount) {
    return ctx.reply(
      `❌ Недостаточно звёзд. У вас только ⭐️${sender?.balance}`
    )
  }

  // Обновляем балансы
  const newSenderBalance = await updateBalanceByUserId(
    senderId,
    -amount
  )
  const newRecipientBalance = await updateBalanceByUserId(
    recipientId,
    amount
  )

  if (newSenderBalance === null || newRecipientBalance === null) {
    return ctx.reply(
      '⚠️ Произошла ошибка при переводе. Попробуйте позже.'
    )
  }

  await updateState(senderId, 'none')

  await ctx.reply(
    `✅ Перевод завершён!
<blockquote>⭐️${amount} отправлено пользователю с ID ${recipientId}</blockquote>`,
    { message_effect_id: '5046509860389126442' }
  )
  await ctx.api.sendMessage(
    recipientId,
    `✅ Вам перечислено ⭐️${amount} от юзера <b>${ctx.from?.first_name}</b>`,
    { message_effect_id: '5046509860389126442' }
  )
}
