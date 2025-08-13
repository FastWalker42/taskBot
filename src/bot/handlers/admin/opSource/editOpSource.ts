import { Context, InlineKeyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import { getOpSourceById } from '../../../../db/methods'

export default async (ctx: Context) => {
  const id = parseCallBack(ctx.callbackQuery?.data!).data
  const opSource = await getOpSourceById(id)

  if (!opSource) {
    await ctx.reply('⚠️ Источник не найден.')
    return
  }

  await ctx.reply(
    `Ссылка <b>${opSource.link}</b>
Режим показа: ${opSource.taskMode ? 'Задания' : 'ОП'}
Цена за задание: ${opSource.taskPrice}`,
    {
      reply_markup: new InlineKeyboard()
        .text('❌ Убрать из ОП', `deleteOpLink-${id}`) // ✅ используем id
        .row()
        .text('Изменить режим', `toggleOpSourceMode-${opSource._id}`)
        .row()
        .text(
          'Задать цену',
          `setOpSourcePriceInputWait-${opSource._id}`
        )
        .row()
        .text('🔙 Назад', 'adminMenu'),
    }
  )
}
