import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'

export default async (ctx: Context) => {
  await ctx.replyWithPhoto(IMAGES.CUBEGAME, {
    caption: `<b>🚀 Мини-игра: КУБИК</b>
<blockquote>Бросаете кубик
Получаете столько звёзд, сколько выпало на кубике.</blockquote>`,

    reply_markup: new InlineKeyboard()
      .text('Сыграть 5⭐️', 'playCube')
      .row()
      .text('Назад 📲', 'main_menu'),
  })
}
