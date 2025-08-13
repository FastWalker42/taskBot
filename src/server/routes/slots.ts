import { Router } from "express"
import { asyncHandler } from "../asyncHandler"
import {
  updateBalanceByUserId,
  getBalanceByUserId,
  getUserIdByToken,
} from "../../db/methods"
import { SLOTS, PAYOUTS } from "../types"
import bot from "../../bot"

const router = Router()

const getRandomSlot = () => SLOTS[Math.floor(Math.random() * SLOTS.length)]

const calculatePayout = (slots: string[]) => {
  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    const payout = PAYOUTS.find((p) => p.symbol === slots[0])
    return payout ? payout.reward : 0
  }
  return 0
}

router.post(
  "/playSlots",
  asyncHandler(async (req, res) => {
    const { token, bet } = req.body

    if (!token) {
      res.status(400).json({ error: "Требуется токен" })
      return
    }

    const betNumber = Number(bet)
    if (isNaN(betNumber) || betNumber < 0 || betNumber > 100) {
      res.status(400).json({ error: "Некорректная ставка" })
      return
    }

    // Получаем ID пользователя по токену
    const userId = await getUserIdByToken(token)
    if (userId === null) {
      res.status(404).json({ error: "Пользователь не найден" })
      return
    }

    // Проверяем баланс
    const currentBalance = await getBalanceByUserId(userId)
    if (currentBalance === null) {
      res.status(404).json({ error: "Ошибка получения баланса" })
      return
    }

    if (currentBalance < betNumber) {
      res.status(400).json({ error: "Недостаточно средств" })
      return
    }

    // Спишем ставку
    let newBalance = await updateBalanceByUserId(userId, -betNumber)
    if (newBalance === null) {
      res.status(500).json({ error: "Ошибка списания" })
      return
    }

    // Генерируем слоты
    const slots = [getRandomSlot(), getRandomSlot(), getRandomSlot()]
    const winMultiplier = calculatePayout(slots)
    const winAmount = betNumber * winMultiplier

    // Зачисляем выигрыш
    if (winAmount > 0) {
      newBalance = await updateBalanceByUserId(userId, winAmount)
      try {
        await bot.api.sendMessage(
          userId,
          `Вы выиграли ${winAmount}⭐
Новый баланс: ${newBalance}`,
          { message_effect_id: "5046509860389126442" }
        )
      } catch (error) {}
      if (newBalance === null) {
        res.status(500).json({ error: "Ошибка зачисления" })
        return
      }
    }

    res.json({
      slots,
      balance: newBalance,
    })
  })
)

export default router
