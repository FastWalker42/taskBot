import { Context } from 'grammy'
import {
  getAllOpChannels,
  getAllOpSources,
  activateUser,
} from '../../db/methods'

export default async (ctx: Context) => {
  if (!ctx.from) return []

  // Получаем все каналы и источники
  let opChannels = await getAllOpChannels()
  let opSources = await getAllOpSources()

  // Фильтруем:
  // - каналы без taskMode
  // - источники без taskMode
  opChannels = opChannels.filter((channel) => !channel.taskMode)
  opSources = opSources.filter((source) => !source.taskMode)

  const opList: { name: string; url: string }[] = []
  const noCheckChannels: { name: string; url: string }[] = []

  let userNotSubscribed = false
  let hasConfirmedSubscription = false

  for (const channel of opChannels) {
    const { id, customLink, enableCheck } = channel
    const url = customLink || null
    if (!url) continue

    if (enableCheck === false) {
      noCheckChannels.push({ name: 'Спонсор', url })
      continue
    }

    try {
      const member = await ctx.api.getChatMember(id, ctx.from.id)
      const isSubscribed = [
        'creator',
        'administrator',
        'member',
      ].includes(member.status)

      if (isSubscribed) {
        hasConfirmedSubscription = true
      } else {
        userNotSubscribed = true
        opList.push({ name: 'Спонсор', url })
      }
    } catch (error) {
      console.error(
        `Ошибка при проверке подписки на канал ${id}:`,
        error
      )
    }
  }

  if (hasConfirmedSubscription) {
    await activateUser(ctx.from.id)
  }

  const isGenericStart =
    ctx.message?.text?.startsWith('/start') &&
    ctx.message.text !== '/start topup'

  if (userNotSubscribed || isGenericStart) {
    // Добавляем только источники с taskMode: false
    for (const bot of opSources) {
      opList.push({
        name: 'Спонсор',
        url: bot.link,
      })
    }

    opList.push(...noCheckChannels)
  }

  return opList
}
