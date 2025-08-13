import { Context, InlineKeyboard, Keyboard } from 'grammy'
import { createAdRef, fetchUser } from '../../../../db/methods'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const text = ctx.message?.text ?? 'none'

  const refka = await createAdRef(text)
  await ctx.reply(`✏️✅ Рефка «${text}» добавлена!
<code>t.me/Vipstars_freebot?start=${refka.payload}</code>`)
  await adminMenu(ctx)
}
