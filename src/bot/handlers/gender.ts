import { Context } from 'grammy'
import { setUserGender } from '../../db/methods'
import parseCallBack from '../utils/parseCallBack'

export default async (ctx: Context) => {
  const { id } = ctx.from!

  const gender = parseCallBack(ctx.callbackQuery?.data!).data

  await setUserGender(id, gender as 'male' | 'female')
}
