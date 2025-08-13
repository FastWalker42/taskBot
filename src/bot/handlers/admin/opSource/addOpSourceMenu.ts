import { Context, InlineKeyboard } from 'grammy'

export default async (ctx: Context) => {
  await ctx.reply(`Выберите опцию:`, {
    reply_markup: new InlineKeyboard()
      .text('Добавить ссылку в ОП', 'addOpSourceInputWait-op')
      .row()
      .text(
        'Добавить ссылку в Задания',
        'addOpSourceInputWait-tasks'
      ),
  })
}
