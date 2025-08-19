import { InputFile } from 'grammy'
import { cryptoBotInvoice, deleteInvoice } from '../api/cryptobot'
import {
  CryptoBotInvoice,
  CryptoBotInvoiceParams,
} from '../api/cryptobot/types'
import {
  AdsRef,
  GreetConfig,
  OpSource,
  OpChannel,
  User,
  PokazConfig,
} from './init'
import { UserInput } from './types'
import bot from '../bot'
import {
  STARS_PER_REF,
  TASKS_TO_REFERAL,
  MINING_AMOUNT,
} from '../../CONFIG.json'

export const fetchUser = async (
  data: UserInput,
  ref?: number | string
) => {
  await unfreezeFunds(data.id)

  let user = await User.findOne({ id: data.id })

  let invited_by: number | undefined = undefined
  let ad_ref_name: string | undefined = undefined
  let ad_ref_payload: string | undefined = undefined
  let shouldIncrementVisits = false
  let shouldIncrementUniqueVisits = false

  if (ref !== undefined) {
    // Попытка обработать ref как id
    if (typeof ref === 'number' || /^\d+$/.test(ref)) {
      const refId = Number(ref)
      const inviter = await User.findOne({ id: refId })
      if (inviter && inviter.id !== data.id) {
        invited_by = refId
      }
    }

    // Если не подошло как id, пробуем как payload
    if (invited_by === undefined && typeof ref === 'string') {
      const adRef = await AdsRef.findOne({ payload: ref })
      if (adRef) {
        ad_ref_name = adRef.name
        ad_ref_payload = adRef.payload
        shouldIncrementVisits = true
        if (!user) {
          shouldIncrementUniqueVisits = true
        }
      }
    }
  }

  // 🔁 Пользователь уже существует
  if (user) {
    if (
      ad_ref_payload &&
      !user.ad_ref_list?.includes(ad_ref_payload)
    ) {
      await User.updateOne(
        { id: data.id },
        { $addToSet: { ad_ref_list: ad_ref_payload } }
      )
      if (shouldIncrementVisits) {
        await AdsRef.updateOne(
          { payload: ad_ref_payload },
          { $inc: { visits: 1 } }
        )
      }
    }
    return user
  }

  // 👋 Новый пользователь
  if (invited_by !== undefined) {
    console.log(`New user invited by: ${invited_by}`)
    try {
      await bot.api.sendMessage(
        invited_by,
        `👋 Новый пользователь зашёл в бота по вашей ссылке!\n\n<blockquote>🔰 Он должен проявить активность в боте (подписки / рулетка / задания), чтобы вы получили звёзды</blockquote>`,
        { message_effect_id: '5046509860389126442' }
      )
    } catch {}
  }

  // 💾 Создаём нового пользователя
  user = new User({
    ...data,
    invited_by,
    ad_ref_name,
    ad_ref_list: ad_ref_payload ? [ad_ref_payload] : [],
  })
  await user.save()

  if (shouldIncrementVisits && ad_ref_payload) {
    await AdsRef.updateOne(
      { payload: ad_ref_payload },
      {
        $inc: {
          visits: 1,
          unique_visits: shouldIncrementUniqueVisits ? 1 : 0,
        },
      }
    )
  }

  return user
}

export const findUserById = async (userId: number) => {
  try {
    const user = await User.findOne({ id: userId }).lean().exec()
    return user || null
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export const getAllUsers = async (): Promise<number[]> => {
  const users = await User.find({}, { id: 1, _id: 0 }).lean()
  const uniqueUsersSet = new Set<number>(
    users.map((u) => Number(u.id))
  )
  return Array.from(uniqueUsersSet)
}

async function getAllUserIds() {
  const users = await User.find({}, { id: 1, _id: 0 }) // только поле id
  return users.map((u) => u.id)
}

export const removeUser = async (id: number) => {
  await User.deleteOne({ id })
}

export const activateUser = async (
  userId: number
): Promise<boolean> => {
  const user = await User.findOneAndUpdate(
    { id: userId, activated: false },
    { $set: { activated: true } },
    { new: true }
  )

  if (!user) return false

  if (user.invited_by) {
    await User.updateOne(
      { id: user.invited_by },
      {
        $inc: {
          referals: 1,
          balance: STARS_PER_REF,
        },
      }
    )

    try {
      await bot.api.sendMessage(
        user.invited_by,
        `🎉 Ваш реферал проявил активность в боте! 
Вы получили ${STARS_PER_REF}⭐️ ‼️`,
        { message_effect_id: '5046509860389126442' }
      )
    } catch (err) {
      console.error(
        `Не удалось отправить сообщение пригласителю ${user.invited_by}:`,
        err
      )
    }
  }

  return true
}

export const incrementTaskDone = async (
  userId: number
): Promise<boolean> => {
  const result = await User.findOneAndUpdate(
    { id: userId },
    { $inc: { tasks_done: 1 } },
    { new: true }
  )

  if (!result) return false

  // Если выполнено больше 10 заданий и пользователь еще не активирован — активируем
  if (result.tasks_done >= TASKS_TO_REFERAL && !result.activated) {
    await activateUser(userId)
  }

  return true
}

export const getUsersBatch = async () => {
  const users = await User.find({})

  return users
}

export const updateLastActivity = async (
  userId: number,
  isPremium?: boolean
): Promise<void> => {
  const updateFields: any = {
    $set: {
      last_activity: new Date(),
    },
    $inc: { clicksCount: 1 },
  }

  if (typeof isPremium === 'boolean') {
    updateFields.$set.is_premium = isPremium
  }

  try {
    await User.updateOne({ id: userId }, updateFields)
  } catch (error) {
    console.error('Error updating last activity:', error)
  }
}

export const setUserGender = async (
  userId: number,
  gender: 'male' | 'female'
): Promise<boolean> => {
  if (gender !== 'male' && gender !== 'female') {
    throw new Error('Invalid gender value')
  }

  const result = await User.findOneAndUpdate(
    { id: userId },
    { $set: { gender } },
    { new: true }
  )

  return result !== null
}
export const getUsersSummary = async () => {
  const usersCount = await User.countDocuments({})
  const maleGender = await User.countDocuments({ gender: 'male' })
  const femaleGender = await User.countDocuments({ gender: 'female' })
  const noGender = await User.countDocuments({
    $or: [{ gender: { $exists: false } }, { gender: null }],
  })
  const premiumUsers = await User.countDocuments({ is_premium: true })

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const activeLastWeek = await User.countDocuments({
    last_activity: { $gte: oneWeekAgo },
  })

  return {
    usersCount,
    maleGender,
    femaleGender,
    noGender,
    premiumUsers,
    activeLastWeek,
  }
}
export const dumpUserIdsToInputFile =
  async (): Promise<InputFile> => {
    const users = await User.find({}, { id: 1, _id: 0 }).lean()
    const ids = users.map((u) => u.id)

    const data = ids.join(' ')
    const buffer = Buffer.from(data, 'utf-8')

    const timestamp = Date.now()
    const filename = `${ids.length}-users-${timestamp}.txt`
    return new InputFile(buffer, filename)
  }

export const addFrozenBalance = async (
  id: number,
  amount: number
): Promise<boolean> => {
  const until = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const result = await User.findOneAndUpdate(
    { id },
    { $push: { frozen_balance: { amount, until } } },
    { new: true }
  )
  return result !== null
}

export const unfreezeFunds = async (
  userId: number
): Promise<void> => {
  const now = new Date()
  const user = await User.findOne({ id: userId })

  if (!user) return

  const expiredFunds = user.frozen_balance.filter(
    (f) => f.until <= now
  )
  if (expiredFunds.length === 0) return

  const totalToUnfreeze = expiredFunds.reduce(
    (sum, f) => sum + f.amount,
    0
  )

  await User.findOneAndUpdate(
    { id: userId },
    {
      $inc: { balance: totalToUnfreeze },
      $pull: { frozen_balance: { until: { $lte: now } } },
    }
  )
}

export const updateState = async (
  id: number,
  newState: string
): Promise<boolean> => {
  try {
    const result = await User.findOneAndUpdate(
      { id },
      { $set: { state: newState } },
      { new: true }
    )
    return !!result
  } catch (error) {
    console.error('Error updating state:', error)
    return false
  }
}

export const getUserIdByToken = async (
  token: string
): Promise<number | null> => {
  const user = await User.findOne(
    { appToken: token },
    { id: 1, _id: 0 }
  ).lean()
  return user?.id ?? null
}

export const getBalanceByUserId = async (
  userId: number
): Promise<number | null> => {
  const user = await User.findOne(
    { id: userId },
    { balance: 1, _id: 0 }
  ).lean()
  return user?.balance ?? null
}

export const updateBalanceByUserId = async (
  userId: number,
  amount: number
): Promise<number | null> => {
  const result = await User.findOneAndUpdate(
    { id: userId },
    { $inc: { balance: amount } },
    { new: true, projection: { balance: 1, _id: 0 } }
  ).lean()
  return result?.balance ?? null
}

export const getTokenByUserId = async (
  userId: number
): Promise<string | null> => {
  const user = await User.findOne(
    { id: userId },
    { appToken: 1, _id: 0 }
  ).lean()
  return user?.appToken ?? null
}

export const getBalanceByToken = async (
  token: string
): Promise<number | null> => {
  const user = await User.findOne(
    { appToken: token },
    { balance: 1, _id: 0 }
  ).lean()
  return user?.balance ?? null
}

export const updateBalanceByToken = async (
  token: string,
  amount: number
): Promise<number | null> => {
  const result = await User.findOneAndUpdate(
    { appToken: token },
    { $inc: { balance: amount } },
    { new: true, projection: { balance: 1, _id: 0 } }
  ).lean()
  return result?.balance ?? null
}

export const updateCashoutRequest = async (
  userId: number,
  amount: number
): Promise<boolean> => {
  try {
    // 1. Проверяем баланс и обновляем заявку в одном запросе
    const result = await User.findOneAndUpdate(
      {
        id: userId,
        balance: { $gte: amount }, // Проверка достаточности средств
      },
      {
        $set: {
          'cashout_request.date': new Date(),
          'cashout_request.amount': amount,
        },
        $inc: { balance: -amount }, // Уменьшаем баланс
      },
      { new: true }
    )

    return !!result // Вернет true если обновление прошло успешно
  } catch (error) {
    console.error('Error updating cashout request:', error)
    return false
  }
}

export const confirmCashoutRequest = async (
  userId: number
): Promise<boolean> => {
  try {
    const result = await User.findOneAndUpdate(
      { id: userId },
      {
        $unset: {
          cashout_request: '', // Удаляем запрос на вывод
        },
      },
      { new: true }
    )
    return !!result
  } catch (error) {
    console.error('Error confirming cashout request:', error)
    return false
  }
}

export const cancelCashoutRequest = async (
  userId: number
): Promise<boolean> => {
  try {
    // Сначала получаем пользователя и сумму вывода
    const user = await User.findOne({
      id: userId,
      'cashout_request.amount': { $exists: true },
    })

    if (!user || !user.cashout_request) {
      return false
    }

    const amount = user.cashout_request.amount

    // Затем обновляем документ
    const result = await User.findOneAndUpdate(
      { id: userId },
      {
        $unset: { cashout_request: '' },
        $inc: { balance: amount }, // Используем полученное значение
      },
      { new: true }
    )

    return !!result
  } catch (error) {
    console.error('Error cancelling cashout request:', error)
    return false
  }
}

export const getOpChannel = async (id: number | string) => {
  return await OpChannel.findOne({ id })
}

export const addOpChannel = async (id: number | string) => {
  const existing = await OpChannel.findOne({ id })
  if (existing) return false

  const channel = new OpChannel({ id })
  await channel.save()
  return true
}

export const addOpChannelAsTask = async (
  id: number | string,
  taskPrice: number = 1
): Promise<boolean> => {
  const existing = await OpChannel.findOne({ id })
  if (existing) return false

  const channel = new OpChannel({
    id,
    enableCheck: true,
    taskMode: true,
    taskPrice,
  })

  await channel.save()
  return true
}

export const deleteOpChannel = async (
  id: number | string
): Promise<void> => {
  await OpChannel.deleteOne({ id })
}

export const getAllOpChannels = async () => {
  const result = await OpChannel.find({})
  return result
}

export const setOpChannelCustomLink = async (
  id: number,
  customLink: string
) => {
  await OpChannel.updateOne(
    { id },
    { $set: { customLink } },
    { upsert: true }
  )
}

export const setOpChannelTaskPrice = async (
  id: number,
  taskPrice: number
): Promise<void> => {
  await OpChannel.updateOne(
    { id },
    { $set: { taskPrice } },
    { upsert: true }
  )
}

export const removeOpChannelCustomLink = async (id: number) => {
  await OpChannel.updateOne({ id }, { $unset: { customLink: '' } })
}

export const toggleOpChannelEnableCheck = async (id: number) => {
  const channel = await OpChannel.findOne({ id })
  if (!channel) throw new Error(`OpChannel с id=${id} не найден`)

  channel.enableCheck = !channel.enableCheck

  if (!channel.enableCheck && channel.taskMode) {
    // При выключении enableCheck, если taskMode true, сбрасываем taskMode
    channel.taskMode = false
  }

  await channel.save()
  return channel.enableCheck
}
export const toggleOpChannelTaskMode = async (id: number) => {
  const channel = await OpChannel.findOne({ id })
  if (!channel) throw new Error(`OpChannel с id=${id} не найден`)

  if (channel.taskMode) {
    channel.taskMode = false
  } else {
    channel.taskMode = true
    channel.enableCheck = true
  }

  await channel.save()
  return channel
}
// methods.ts
export const getAllOpSources = async () => {
  return await OpSource.find({})
}

export const getOpSourceById = async (id: string) => {
  return await OpSource.findById(id)
}

export const addOpSource = async (
  link: string,
  taskMode: boolean = false,
  taskPrice: number = 1
): Promise<boolean> => {
  const existing = await OpSource.findOne({ link })
  if (existing) return false

  const bot = new OpSource({ link, taskMode, taskPrice })
  await bot.save()
  return true
}

export const deleteOpSource = async (id: string): Promise<void> => {
  await OpSource.findByIdAndDelete(id)
}

// Добавляем новые методы для управления taskMode
export const toggleOpSourceTaskMode = async (
  id: string
): Promise<boolean> => {
  const source = await OpSource.findById(id)
  if (!source) throw new Error(`OpSource с id=${id} не найден`)

  source.taskMode = !source.taskMode
  await source.save()
  return source.taskMode
}

export const setOpSourceTaskPrice = async (
  id: string,
  taskPrice: number
): Promise<void> => {
  await OpSource.findByIdAndUpdate(
    id,
    { $set: { taskPrice } },
    { new: true }
  )
}

export const createCryptoBotInvoice = async (
  userId: number,
  params: CryptoBotInvoiceParams
): Promise<CryptoBotInvoice | null> => {
  try {
    const invoice = await cryptoBotInvoice(params)

    const result = await User.findOneAndUpdate(
      { id: userId },
      { $set: { topup_request: invoice } },
      { new: true }
    )

    if (!result) {
      console.warn(`User ${userId} not found to save invoice`)
      return null
    }

    return invoice
  } catch (error) {
    console.error('Error creating invoice:', error)
    return null
  }
}

export const deleteCryptoBotInvoice = async (
  userId: number,
  invoiceId: string
): Promise<boolean> => {
  try {
    const apiResult = await deleteInvoice(invoiceId)
    if (!apiResult) {
      throw new Error('Failed to delete invoice in CryptoBot')
    }

    const userUpdate = await User.findOneAndUpdate(
      { id: userId },
      { $unset: { topup_request: '' } },
      { new: true }
    )

    if (!userUpdate) {
      console.warn(`User ${userId} not found when clearing invoice`)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return false
  }
}

export const addSubscriptions = async (
  userId: number,
  channelIds: number[]
): Promise<boolean> => {
  if (!channelIds.length) return false

  const user = await User.findOne({ id: userId }, { subscribed: 1 })
  if (!user) return false

  const currentSubs = user.subscribed || []
  const newUnique = channelIds.filter(
    (id) => !currentSubs.includes(id)
  )

  if (!newUnique.length) return true

  const result = await User.updateOne(
    { id: userId },
    { $push: { subscribed: { $each: newUnique } } }
  )

  return result.modifiedCount > 0
}

export const countChannelSubscribers = async (
  channelId: number | string
): Promise<number> => {
  const count = await User.countDocuments({
    subscribed: channelId,
  })
  return count
}

export const syncUserChannelSubscription = async (
  userId: number,
  taskPrice: number,
  channelId: number,
  isSubscribed: boolean
): Promise<void> => {
  const user = await User.findOne(
    { id: userId },
    { subscribed: 1, frozen_balance: 1 }
  )

  if (!user) return

  const hasChannelInSubs = user.subscribed.includes(channelId)
  const hasFrozenPayment = user.frozen_balance.some(
    (fb) => fb.channelId === channelId
  )

  // 🟥 Пользователь не подписан
  if (!isSubscribed) {
    if (hasFrozenPayment || hasChannelInSubs) {
      await User.updateOne(
        { id: userId },
        {
          $pull: {
            subscribed: channelId,
            frozen_balance: { channelId },
          },
        }
      )
    }
    return
  }

  // ✅ Пользователь подписан
  if (!hasChannelInSubs) {
    const until = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 дня

    await User.updateOne(
      { id: userId },
      {
        $push: {
          subscribed: channelId,
          frozen_balance: {
            amount: taskPrice,
            until,
            channelId,
          },
        },
      }
    )

    try {
      await bot.api.sendMessage(
        userId,
        `⭐️❤️ Благодарим за подписку,
🤑 Задание выполнено!
<blockquote>на счёт начислено ${taskPrice}⭐️</blockquote>`
      )
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err)
    }
  }
}

export const confirmUserOp = async (
  userId: number
): Promise<boolean> => {
  // Получаем только каналы БЕЗ taskMode
  const opChannels = await OpChannel.find(
    { taskMode: { $ne: true } }, // <-- ключевой фильтр
    { id: 1, _id: 0 }
  ).lean()

  if (!opChannels.length) return false

  const channelIds = opChannels.map((c) => c.id)

  // Получаем пользователя с подписками
  const user = await User.findOne({ id: userId }, { subscribed: 1 })
  if (!user) return false

  const currentSubs = user.subscribed || []
  const newChannels = channelIds.filter(
    (id) => !currentSubs.includes(id)
  )

  if (!newChannels.length) return true // Все каналы уже есть

  // Добавляем только недостающие каналы в подписки
  const result = await User.updateOne(
    { id: userId },
    { $push: { subscribed: { $each: newChannels } } }
  )

  return result.modifiedCount > 0
}

export async function createAdRef(name: string) {
  const existing = await AdsRef.findOne({ name }).lean()
  if (existing) throw new Error('Ref with this name already exists')

  const ref = await AdsRef.create({
    name,
    clicks: 0,
    createdAt: new Date(),
  })

  return ref
}

export async function deleteAdRef(payload: string) {
  const result = await AdsRef.findOneAndDelete({ payload })
  if (!result) throw new Error('Referral not found')
  return result
}

export async function getAllAdsRefs() {
  const refs = await AdsRef.find().sort({ createdAt: -1 }).lean()
  return refs
}

export const countActivatedUsersByAdRef = async (
  payload: string
): Promise<number> => {
  try {
    const count = await User.countDocuments({
      ad_ref_list: payload,
      activated: true,
    })
    return count
  } catch (error) {
    console.error('Error counting activated users by ad ref:', error)
    return 0
  }
}

export async function toggleAdsRefShowOnlyUnique(payload: string) {
  const ref = await AdsRef.findOne({ payload })
  if (!ref) throw new Error('Referral not found')

  ref.showOnlyUnique = !ref.showOnlyUnique
  await ref.save()

  return ref
}

export async function getGreetText() {
  let config = await GreetConfig.findOne()
  if (!config) {
    config = await GreetConfig.create({})
  }
  return config.greetText
}

export async function setGreetText(text: string) {
  const config = await GreetConfig.findOne()
  if (config) {
    config.greetText = text
    await config.save()
  } else {
    await GreetConfig.create({ greetText: text })
  }
}

// Начать поиск дуэли (сделать ставку) + сохранить ID сообщения
export const startDuelSearch = async (
  userId: number,
  amount: number,
  messageId: number
): Promise<{
  status: 'waiting' | 'duel_completed'
  opponentId?: number
  winnerId?: number
  loserId?: number
  amount?: number
  firstUserMessageId?: number
  secondUserMessageId?: number
}> => {
  const user = await User.findOne({ id: userId })
  if (!user) throw new Error('Пользователь не найден')
  if (user.balance < amount) throw new Error('Недостаточно средств')

  user.balance -= amount
  user.duelBet = amount
  user.duelMessageId = messageId
  await user.save()

  // Ищем соперника
  const opponent = await User.findOne({
    duelBet: amount,
    id: { $ne: userId },
  })

  if (!opponent) {
    return {
      status: 'waiting',
      firstUserMessageId: messageId,
    }
  }

  // Сохраняем ID сообщения соперника перед обновлением
  const secondUserMessageId = opponent.duelMessageId

  // Проводим дуэль
  const winnerId = Math.random() > 0.5 ? userId : opponent.id
  const loserId = winnerId === userId ? opponent.id : userId

  // Обновляем балансы и очищаем данные дуэли
  await User.updateOne(
    { id: winnerId },
    {
      $inc: { balance: amount * 1.8 },
      $unset: { duelBet: '', duelMessageId: '' },
    }
  )

  await User.updateOne(
    { id: loserId },
    { $unset: { duelBet: '', duelMessageId: '' } }
  )

  return {
    status: 'duel_completed',
    opponentId: opponent.id,
    winnerId,
    loserId,
    amount,
    firstUserMessageId: messageId,
    secondUserMessageId,
  }
}

// Отменить поиск дуэли + очистить ID сообщения
export const cancelDuelSearch = async (
  userId: number
): Promise<boolean> => {
  const user = await User.findOne({ id: userId })
  if (!user || !user.duelBet) return false

  // Возвращаем средства и очищаем данные
  user.balance += user.duelBet
  user.duelBet = 0
  user.duelMessageId = undefined // ОЧИЩАЕМ ID СООБЩЕНИЯ
  await user.save()

  return true
}

// Получить данные о текущей дуэли
export const getDuelData = async (
  userId: number
): Promise<{
  betAmount: number
  messageId?: number
  inProgress: boolean
}> => {
  const user = await User.findOne({ id: userId })
  return {
    betAmount: user?.duelBet || 0,
    messageId: user?.duelMessageId,
    inProgress: !!user?.duelBet,
  }
}

export async function getPokazText(options?: {
  adsMode?: boolean
}): Promise<{
  text: string
  count: number
}> {
  const adsMode = options?.adsMode ?? false
  let config = await PokazConfig.findOne()

  if (!config) {
    config = await PokazConfig.create({})
    return {
      text: config.pokazText,
      count: config.showedCount,
    }
  }

  if (adsMode) {
    config.showedCount += 1
    await config.save()
  }

  return {
    text: config.pokazText,
    count: config.showedCount,
  }
}

export async function resetPokazCounter(): Promise<boolean> {
  const result = await PokazConfig.updateOne(
    {},
    { $set: { showedCount: 0 } }
  )
  return result.modifiedCount > 0
}

export async function setPokazText(text: string) {
  const config = await PokazConfig.findOne()
  if (config) {
    config.pokazText = text
    await config.save()
  } else {
    await PokazConfig.create({ pokazText: text })
  }
}

export const doMining = async (userId: number): Promise<number> => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 1 hour ago

  const user = await User.findOne({ id: userId })
  if (!user) return 0

  // Check if last mining was more than 1 hour ago or never happened
  if (!user.last_mining || user.last_mining < oneHourAgo) {
    const miningAmount = MINING_AMOUNT ?? 1 // Amount to mine

    // Update user balance and last mining time
    user.balance += miningAmount
    user.last_mining = now
    await user.save()

    return miningAmount
  }

  return 0 // Mining not available yet
}
