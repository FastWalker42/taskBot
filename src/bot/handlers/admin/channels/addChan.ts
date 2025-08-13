import { Context } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import {
  addOpChannel,
  addOpChannelAsTask,
} from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  try {
    const rawId = parseCallBack(ctx.callbackQuery?.data!).data

    let success = false
    let isTask = false

    if (typeof rawId === 'string' && rawId.startsWith('task-')) {
      const actualId = rawId.slice('task-'.length) // сохраняем минус, если он есть
      isTask = true
      success = await addOpChannelAsTask(Number(actualId))
    } else {
      success = await addOpChannel(Number(rawId))
    }

    if (success) {
      await ctx.reply(
        isTask
          ? 'Канал добавлен в задания ✅'
          : 'Канал добавлен в ОП ✅'
      )
    } else {
      await ctx.reply(
        isTask
          ? 'Канал уже есть в заданиях ⚠️'
          : 'Канал уже есть в ОП ⚠️'
      )
    }

    await adminMenu(ctx)
  } catch (error) {
    console.error(error)
    await ctx.reply('Произошла ошибка при добавлении канала ❌')
  }
}
