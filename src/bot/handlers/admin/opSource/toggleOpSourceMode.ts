import { Context } from 'grammy'
import { toggleOpSourceTaskMode } from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import editOpSource from './editOpSource'

export default async (ctx: Context) => {
  const opSourceId = parseCallBack(ctx.callbackQuery?.data!).data

  await toggleOpSourceTaskMode(opSourceId)
  await editOpSource(ctx)
}
