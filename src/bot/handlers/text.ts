import { Context } from 'grammy'
import { fetchUser } from '../../db/methods'
import cryptoBotTopUp from './topup/crypto/cryptoBotTopUp'
import parseCallback from '../utils/parseCallBack'
import start from './start'
import starsTopUp from './topup/stars/starsTopUp'
import addOpSource from './admin/opSource/addOpSource'
import addOpSourceInputWait from './admin/opSource/addOpSourceInputWait'
import prospamConfirm from './admin/prospamConfirm'
import makeAdsRef from './admin/adsRef/makeAdsRef'
import greetEditText from './admin/greet/greetEditText'
import setChanLink from './admin/channels/setChanLink'
import setChanPrice from './admin/channels/setChanPrice'
import manageUser from './admin/manageUser'
import setOpSourcePrice from './admin/opSource/setOpSourcePrice'
import pokazEditText from './admin/pokaz/pokazEditText'

export default async (ctx: Context) => {
  const { id } = ctx.from!

  const user = await fetchUser({ id })

  // Если пользователь не найден или состояние отсутствует — отправляем на старт
  if (!user || !user.state || user.state === 'none') {
    //await start(ctx)
    return
  }

  // Пробуем безопасно распарсить state
  let parsedState: { action: string } | null = null
  try {
    parsedState = parseCallback(user.state)
  } catch (error) {
    console.error('Ошибка парсинга состояния:', error)
    await start(ctx)
    return
  }

  // Выбор действия по распарсенному состоянию
  switch (parsedState.action) {
    case 'cryptoBotInputWait':
      await cryptoBotTopUp(ctx)
      break
    case 'starsTopUpInputWait':
      await starsTopUp(ctx)
      break
    case 'addOpSourceInputWait':
      await addOpSource(ctx)
      break
    case 'prospamInputWait':
      await prospamConfirm(ctx)
      break
    case 'makeAdsRefInputWait':
      await makeAdsRef(ctx)
      break
    case 'greetEditTextInputWait':
      await greetEditText(ctx)
      break
    case 'pokazEditTextInputWait':
      await pokazEditText(ctx)
      break
    case 'setChanLinkInputWait':
      await setChanLink(ctx)
      break
    case 'setChanPriceInputWait':
      await setChanPrice(ctx)
      break
    case 'manageUserInputWait':
      await manageUser(ctx)
      break
    case 'setOpSourcePriceInputWait':
      await setOpSourcePrice(ctx)
      break
    default:
      await start(ctx)
      break
  }
}
