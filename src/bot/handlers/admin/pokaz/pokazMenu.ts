import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { getPokazText } from '../../../../db/methods'

export default async (ctx: Context) => {
  const pokaz = await getPokazText()

  await ctx.reply(
    `Редактировать показ
Количество просмотров: ${pokaz.count}
Текущий текст:

${pokaz.text}`,
    {
      reply_markup: new InlineKeyboard()
        .text(`Ввести новый текст / кнопки`, `pokazEditTextInputWait`)
        .row()
        .text('Очистить показ (со счётчиком)', 'clearPokaz')
        .text('🔙 Назад', 'adminMenu'),
    }
  )
}
