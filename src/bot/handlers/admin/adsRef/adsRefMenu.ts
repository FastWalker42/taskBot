import { Context, InlineKeyboard, Keyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import { getAllAdsRefs } from '../../../../db/methods'

export default async (ctx: Context) => {
  const adsRefs = await getAllAdsRefs()
  const kb = new InlineKeyboard()

  // Добавляем кнопки с переносом после каждых двух
  for (let i = 0; i < adsRefs.length; i++) {
    const adsRef = adsRefs[i]
    kb.text(adsRef.name, `editAdsRef-${adsRef.payload}`)

    // Добавляем перенос после каждой второй кнопки или если это последняя кнопка
    if (i % 2 === 1 || i === adsRefs.length - 1) {
      kb.row()
    }
  }

  kb.text('🔙 Назад', 'adminMenu')

  await ctx.reply('Редактировать рефки', { reply_markup: kb })
}
