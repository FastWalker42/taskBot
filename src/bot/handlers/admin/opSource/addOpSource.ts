import { Context, InlineKeyboard } from 'grammy'
import { addOpSource, fetchUser } from '../../../../db/methods'
import adminMenu from '../adminMenu'
import parseCallBack from '../../../utils/parseCallBack'

export default async (ctx: Context) => {
  const text = ctx.message?.text ?? 'none'
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('Ошибка: пользователь не идентифицирован')
    return
  }

  const isValidLink =
    text.startsWith('https://t.me') ||
    text.startsWith('http://t.me') ||
    text.startsWith('t.me/')

  if (!isValidLink) {
    await ctx.reply('⚠️ Неверная ссылка', {
      reply_markup: new InlineKeyboard().text(
        '❌ Отменить',
        'main_menu'
      ),
    })
    return
  }

  try {
    // Получаем пользователя и его состояние
    const user = await fetchUser({ id: userId })
    if (!user?.state) {
      await ctx.reply('Ошибка: состояние не найдено')
      return
    }

    // Парсим состояние
    const stateData = parseCallBack(user.state).data // 'op' или 'tasks'

    if (stateData === 'tasks') {
      // Добавляем как задание
      await addOpSource(text, true)
      await ctx.reply(`🔗✅ Ссылка ${text} добавлена как задание!`)
    } else {
      // Добавляем как обычный источник ОП (по умолчанию)
      await addOpSource(text, false)
      await ctx.reply(`🔗✅ Ссылка ${text} добавлена в ОП!`)
    }

    await adminMenu(ctx)
  } catch (error) {
    console.error('Ошибка при добавлении ссылки:', error)
    await ctx.reply('⚠️ Произошла ошибка при добавлении ссылки')
  }
}
