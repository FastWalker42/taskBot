import { Context, InlineKeyboard } from 'grammy'
import { fetchUser, updateCashoutRequest } from '../../../db/methods'
import start from '../start'
import { ADMINS, IMAGES } from '../../../../CONFIG.json'
import parseCallBack from '../../utils/parseCallBack'

export default async (ctx: Context) => {
  const { id, username } = ctx.from!
  const callbackData = ctx.callbackQuery?.data!

  const { data } = parseCallBack(callbackData)

  const amountToWithdraw = Number(data)
  const user = await fetchUser({ id: id })
  const balance = user?.balance ?? 0

  const keyboard = new InlineKeyboard().text(
    '❌ Отменить',
    'main_menu'
  )

  if (amountToWithdraw > balance) {
    return ctx.replyWithPhoto(IMAGES.TOPUP, {
      caption: `<b>⚠️ Недостаточно средств для вывода ⭐️${amountToWithdraw}</b>\nНа балансе: ⭐️${balance}`,
      reply_markup: keyboard,
    })
  }

  await updateCashoutRequest(id, amountToWithdraw)
  await ctx.reply(`✅ Запрошен вывод ⭐️${amountToWithdraw}`)

  for (const admin of ADMINS) {
    try {
      await ctx.api.sendMessage(
        admin,
        `Запрос на вывод ${amountToWithdraw}⭐ от 🆔 <code>${id}</code>\n@${
          username ?? '(нет юза)'
        }`,
        {
          reply_markup: new InlineKeyboard()
            .text('💸 СПИСАТЬ С БАЛАНСА', `confirmCashout-${id}`)
            .row()
            .text('❌ Отклонить заявку', `cancelCashout-${id}`),
        }
      )
    } catch (error) {
      console.error(
        `Не удалось отправить сообщение админу ${admin}:`,
        error
      )
    }
  }

  await start(ctx)
}
