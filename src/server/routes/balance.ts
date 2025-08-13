import { Router } from "express"
import { asyncHandler } from "../asyncHandler"
import { getBalanceByToken } from "../../db/methods"

const router = Router()

router.get(
  "/getBalance",
  asyncHandler(async (req, res) => {
    const { token } = req.query

    if (!token) {
      res.status(400).json({
        ok: false,
        error: "Требуется параметр token",
      })
    }

    const balance = await getBalanceByToken(token as string)

    if (balance === null) {
      res.status(404).json({
        ok: false,
        error: "Пользователь не найден",
      })
    }

    res.json({ ok: true, balance })
  })
)

export default router
