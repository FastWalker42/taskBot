import { Context, InlineKeyboard, Keyboard } from 'grammy'
import {
  getAllOpChannels,
  getAllOpSources,
  updateState,
  getAllAdsRefs,
} from '../../../db/methods'

export default async (ctx: Context) => {
  const { id } = ctx.from!
  await updateState(id, 'none')

  const opChannels = await getAllOpChannels()
  const opSources = await getAllOpSources()
  const adsRefs = await getAllAdsRefs()

  await ctx.reply('<b>👑 Панель управления</b>', {
    reply_markup: new InlineKeyboard()
      .text('👋 Приветка', 'greetMenu')
      .text('👁 Показ', 'pokazMenu')
      .row()
      .text('🔗 Создать рефку', 'makeAdsRefInputWait')
      .text(`👀 Все рефки (${adsRefs.length})`, 'adsRefMenu')
      .row()
      .text('📊 Статистика по боту', 'botStats')
      .row()
      .text('🔎 Получить данные по 🆔', 'manageUserInputWait')
      .row()
      .text('📤 Запустить рассылку', 'prospamInputWait')
      .row()
      .text('📂 Список юзеров файлом', 'txtDump')
      .row()
      .text(
        `🌐 Список ресурсов (${
          opChannels.length + opSources.length
        })`,
        'opEdit'
      )
      .row()
      .text('🔗 Добавить ссылку', 'addOpSourceMenu'),
  })
}
