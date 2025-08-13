import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'

export default async (ctx: Context) => {
  await ctx.replyWithPhoto(IMAGES.BOOST, {
    caption: `🚀 <b>УСИЛЕНИЕ</b>
`,

    reply_markup: new InlineKeyboard().text('Назад 📲', 'main_menu'),
    message_effect_id: '5104841245755180586',
  })
}
