import { Context, InlineKeyboard } from 'grammy'
import { IMAGES } from '../../../CONFIG.json'

export default async (ctx: Context) => {
  await ctx.replyWithPhoto(IMAGES.RULES, {
    caption: `<b>🔹 ПРАВИЛА БОТА</b>
<blockquote>👔 Выполняй задания — <b>получай звёзды</b> ⭐

За каждого приглашённого друга +1 ⭐

🔰 Вывод звёздочек доступен через 2 дня  
⚠️ Нельзя отписываться в течение 2 дней
</blockquote>
`,
    reply_markup: new InlineKeyboard().text('Назад 📲', 'main_menu'),
  })
}
