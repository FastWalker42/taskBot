import { Context } from 'grammy'
import {
  fetchUser,
  setOpChannelTaskPrice,
  updateState,
} from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import editChan from './editChan'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  const user = await fetchUser({ id })

  const channelId = Number(parseCallBack(user?.state!).data)
  const text = ctx.message?.text ?? ''

  const price = Number(text)

  if (isNaN(price) || price <= 0) {
    return ctx.reply(
      '⚠️ Введите корректную положительную цену (число).'
    )
  }

  await setOpChannelTaskPrice(channelId, price)

  await updateState(id, 'none')

  await ctx.reply(
    `✅ Установлена цена ${price}⭐️ для канала с ID ${channelId}`
  )
  await adminMenu(ctx)
}
