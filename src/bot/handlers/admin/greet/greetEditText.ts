import { Context } from 'grammy'
import { setGreetText } from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const text = ctx.message!.text ?? 'none'
  await setGreetText(text)

  await ctx.reply(`✅ Текст приветки изменён!`)
  await adminMenu(ctx)
}
