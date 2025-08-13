import { Context, InlineKeyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import {
  getAllAdsRefs,
  countActivatedUsersByAdRef,
} from '../../../../db/methods'

export default async (ctx: Context) => {
  const adsRefs = await getAllAdsRefs()
  const adsRefPayload = parseCallBack(ctx.callbackQuery?.data!).data

  const foundAdRef = adsRefs.find(
    (ref) => ref.payload === adsRefPayload
  )

  if (!foundAdRef) return

  const link = `<code>t.me/Vipstars_freebot?start=${adsRefPayload}</code>`

  // Получаем статистику по активированным пользователям
  const activatedUsers = await countActivatedUsersByAdRef(
    foundAdRef.payload
  )

  // Генерация текста переходов
  let visitsInfo = ''

  if (foundAdRef.showOnlyUnique) {
    visitsInfo = `👁 Всего переходов: ${foundAdRef.unique_visits}`
  } else {
    visitsInfo = `👁 Всего переходов: ${foundAdRef.visits}
🔮 Уникальных: ${foundAdRef.unique_visits}
🎯 Прошло ОПшку: ${activatedUsers}`
  }

  // Генерация текста кнопки переключения
  const toggleLabel = foundAdRef.showOnlyUnique
    ? '🎭 Переключить вид (уникальные)'
    : '🎭 Переключить вид (все)'

  // Ответ пользователю
  await ctx.reply(
    `Ссылка «${foundAdRef.name}»\n${link}\n\n${visitsInfo}`,
    {
      reply_markup: new InlineKeyboard()
        .text(
          '❌ Удалить ссылку',
          `deleteAdsRef-${foundAdRef.payload}`
        )
        .row()
        .text(toggleLabel, `adsRefOnlyUnique-${foundAdRef.payload}`)
        .row()
        .text('🔙 Назад', 'adminMenu'),
    }
  )
}
