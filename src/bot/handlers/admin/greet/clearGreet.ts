import { Context } from 'grammy'
import { setGreetText } from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  await setGreetText('none')

  await ctx.reply('✅ Приветка очищена')
  await adminMenu(ctx)
}
