import { Context, InlineKeyboard } from 'grammy'
import {
  fetchUser,
  getAllOpChannels,
  getAllOpSources,
  syncUserChannelSubscription,
} from '../../db/methods'
import {
  requestOpSubgram,
  checkUserSubscriptions,
} from '../../api/subgram'
import { FLYER, IMAGES, STARS_PER_TASK } from '../../../CONFIG.json'
import { flyerCheckMessage, flyerGetTasks } from '../../api/flyer'

export const getTasks = async (ctx: Context) => {
  const userData = await fetchUser({ id: ctx.from!.id })

  const loadingSticker = await ctx.replyWithSticker(
    'CAACAgIAAxkBAAE0aVRoFfOOpaTf2ajxxJpUKh-xy2Z57QACryUAApuicEu4OcV9u14IZjYE'
  )

  const { id, is_premium, first_name } = ctx.from!

  const tasksSubgram = await requestOpSubgram(
    id,
    is_premium ?? false,
    first_name,
    ctx.from!.language_code || 'ru',
    userData.gender || undefined
  )

  console.log('tasksSubgram:', tasksSubgram)

  const nonChannelLinks =
    tasksSubgram.additional?.sponsors
      ?.filter((s) => s.type !== 'channel')
      .map((s) => s.link) || []

  if (nonChannelLinks.length > 0) {
    try {
      await checkUserSubscriptions(
        ctx.from!.id,
        nonChannelLinks,
        new Date().toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      )
    } catch (err) {
      console.error('Ошибка при проверке Subgram ссылок:', err)
    }
  }

  const kb = new InlineKeyboard()
  const buttons: { name: string; url: string }[] = []

  // === SUBGRAM ===
  if (tasksSubgram.links) {
    tasksSubgram.links.forEach((link) => {
      buttons.push({
        name: `${STARS_PER_TASK}⭐️ Подписаться`,
        url: link,
      })
    })
  }

  if (tasksSubgram.additional?.sponsors) {
    tasksSubgram.additional.sponsors.forEach((sponsor, index) => {
      if (sponsor.type !== 'bot') {
        buttons.push({
          name: `${STARS_PER_TASK}⭐️ ${
            sponsor.resource_name ?? `Спонсор ${index}`
          }`,
          url: sponsor.link,
        })
      }
    })
  }

  // === FLYER TASKS ===
  const flyerTasks = await flyerGetTasks(
    id,
    ctx.from!.language_code || 'ru'
  )

  if (flyerTasks.result && Array.isArray(flyerTasks.result)) {
    flyerTasks.result.forEach((task) => {
      const title = `${task.price ?? '?'}⭐️ ${
        task.name || 'Flyer-задание'
      }`
      if (typeof task.link === 'string') {
        buttons.push({ name: title, url: task.link })
      } else if (Array.isArray(task.links)) {
        task.links.forEach((link: string) => {
          if (typeof link === 'string' && link.startsWith('http')) {
            buttons.push({ name: title, url: link })
          }
        })
      }
    })
  }

  // === LOCAL TASKS (оплаченные каналы) ===
  let localStars = 0

  const opChannels = (await getAllOpChannels()).filter(
    (ch) => ch.taskMode === true
  )

  for (const channel of opChannels) {
    const url = channel.customLink
    const taskPrice = channel.taskPrice || 1
    if (!url) continue

    try {
      const member = await ctx.api.getChatMember(
        channel.id,
        ctx.from!.id
      )
      const isSubscribed = [
        'creator',
        'administrator',
        'member',
      ].includes(member.status)

      await syncUserChannelSubscription(
        ctx.from!.id,
        taskPrice,
        channel.id,
        isSubscribed
      )

      if (!isSubscribed) {
        buttons.push({
          name: `${taskPrice}⭐️ Подписаться`,
          url,
        })
        localStars += taskPrice
      }
    } catch (error) {
      console.error(
        `Ошибка при проверке подписки на ${channel.id}`,
        error
      )
    }
  }

  // === OP SOURCES TASKS ===
  const opSources = (await getAllOpSources()).filter(
    (source) => source.taskMode === true
  )

  for (const source of opSources) {
    const taskPrice = source.taskPrice || 1
    buttons.push({
      name: `${taskPrice}⭐️ Перейти`,
      url: source.link,
    })
    localStars += taskPrice
  }

  // === Сборка клавиатуры ===
  buttons.forEach((btn, i) => {
    kb.url(btn.name, btn.url)
    if (i % 2 !== 0) kb.row()
  })

  kb.row()
    .text('♻️ ПРОВЕРИТЬ ♻️', 'getTasks')
    .row()
    .text('📲 Назад в меню', 'main_menu')

  const totalStars =
    (tasksSubgram.links?.length || 0) * STARS_PER_TASK +
    (tasksSubgram.additional?.sponsors?.filter(
      (s) => s.type !== 'bot'
    ).length || 0) *
      STARS_PER_TASK +
    localStars

  await ctx.replyWithPhoto(IMAGES.TASKS, {
    caption: `📝 Доступные задания (появляются раз в 3 часа)

‼️ ЗАСЧИТЫВАЕТ В ТЕЧЕНИЕ СУТОК
<blockquote expandable>
<b>‼️ ГАЙД (развернуть)</b>

Вы подписываетесь на спонсоров (всех, или нескольких по желанию) и получаете награду.
⚠️ Нельзя отписываться, иначе звезды спишет назад.
Если нет доступных заданий — зайдите с другого аккаунта, на котором вы регулярно сидите.
</blockquote>`,
    reply_markup: kb,
  })

  await ctx.api.deleteMessage(ctx.chat!.id, loadingSticker.message_id)
}
