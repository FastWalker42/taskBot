import { Context } from 'grammy'
import {
  resetPokazCounter,
  setPokazText,
} from '../../../../db/methods'
import pokazMenu from './pokazMenu'

export default async (ctx: Context) => {
  await setPokazText('none')
  await resetPokazCounter()

  await ctx.reply('✅ Показ очищен')
  await pokazMenu(ctx)
}
