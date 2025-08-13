import { Context } from 'grammy'
import {
  fetchUser,
  setOpSourceTaskPrice,
} from '../../../../db/methods'
import parseCallBack from '../../../utils/parseCallBack'
import adminMenu from '../adminMenu'

export default async (ctx: Context) => {
  const text = ctx.message?.text
  const userId = ctx.from?.id

  if (!userId || !text) {
    await ctx.reply('Ошибка: не удалось обработать запрос')
    return
  }

  // Проверяем, что текст сообщения - это число
  const price = parseInt(text)
  if (isNaN(price) || price <= 0) {
    await ctx.reply(
      '⚠️ Пожалуйста, введите корректное положительное число'
    )
    return
  }

  try {
    // Получаем состояние пользователя (где хранится ID opSource)
    const user = await fetchUser({ id: userId })
    if (!user?.state) {
      await ctx.reply('Ошибка: состояние не найдено')
      return
    }

    // Парсим состояние (формат: "setOpSourcePriceInputWait-<id>")
    const opSourceId = parseCallBack(user.state).data

    // Устанавливаем новую цену
    await setOpSourceTaskPrice(opSourceId, price)

    // Возвращаемся к редактированию источника
    await ctx.reply(`✅ Цена успешно установлена: ${price}⭐️`)
    await adminMenu(ctx)
  } catch (error) {
    console.error('Ошибка при установке цены:', error)
    await ctx.reply('⚠️ Произошла ошибка при установке цены')
  }
}
