import { Context } from 'grammy'
import { setPokazText } from '../../../../db/methods'
import pokazMenu from './pokazMenu'

export default async (ctx: Context) => {
  const text = ctx.message!.text ?? 'none'
  await setPokazText(text)

  await ctx.reply(`✅ Текст показа изменён!`)
  await pokazMenu(ctx)
}
