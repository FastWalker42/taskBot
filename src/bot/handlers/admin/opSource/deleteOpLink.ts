import { Context } from 'grammy'
import { deleteOpSource } from '../../../../db/methods'
import adminMenu from '../adminMenu'
import parseCallBack from '../../../utils/parseCallBack'

export default async (ctx: Context) => {
  try {
    const id = parseCallBack(ctx.callbackQuery?.data!).data
    await deleteOpSource(id)
    await ctx.reply('Ссылка удалена из ОП ✅')
    await adminMenu(ctx)
  } catch (error) {
    console.log(error)
  }
}
