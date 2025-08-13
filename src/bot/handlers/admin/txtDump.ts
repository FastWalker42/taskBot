import { Context } from 'grammy'
import { dumpUserIdsToInputFile } from '../../../db/methods'
import adminMenu from './adminMenu'

export default async (ctx: Context) => {
  await ctx.replyWithDocument(await dumpUserIdsToInputFile())
  await adminMenu(ctx)
}
