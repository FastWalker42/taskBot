import { Context } from 'grammy'
import { updateState } from '../../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'greetEditTextInputWait')

  await ctx.reply(`Введи новый текст приветки`)
}
