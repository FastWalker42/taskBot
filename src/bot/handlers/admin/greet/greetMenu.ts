import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { getGreetText } from '../../../../db/methods'

export default async (ctx: Context) => {
  const greetText = await getGreetText()

  await ctx.reply(
    `Редактировать приветку
Текущий текст:

${greetText}`,
    {
      reply_markup: new InlineKeyboard()
        .text(`Ввести новый текст / кнопки`, `greetEditTextInputWait`)
        .row()
        .text('Очистить приветку', 'clearGreet')
        .text('🔙 Назад', 'adminMenu'),
    }
  )
}
