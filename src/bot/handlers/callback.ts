import { Context } from 'grammy'
import { profileInfo } from './profile'
import start from './start'
import { getTasks } from './tasks'

import topupMenu from './topup/topupMenu'

import cryptoBotInputWait from './topup/crypto/cryptoBotInputWait'

import parseCallback from '../utils/parseCallBack'

import starsTopUpInputWait from './topup/stars/starsTopUpInputWait'
import { starsTransferMenu } from './cashout/starsTransferMenu'
import starsCashoutMenu from './cashout/starsCashoutMenu'

import boost from './boost'
import cashoutMenu from './cashout/cashoutMenu'
import starsCashout from './cashout/starsCashout'
import checkCbInvoice from './topup/crypto/checkCbInvoice'
import deleteCbInvoice from './topup/crypto/deleteCbInvoice'
import opEdit from './admin/opEdit'
import adminMenu from './admin/adminMenu'
import botStats from './admin/botStats'
import editChan from './admin/channels/editChan'
import deleteChan from './admin/channels/deleteChan'
import editOpSource from './admin/opSource/editOpSource'
import deleteOpLink from './admin/opSource/deleteOpLink'
import gender from './gender'
import {
  fetchUser,
  getPokazText,
  updateLastActivity,
} from '../../db/methods'
import txtDump from './admin/txtDump'
import prospamInputWait from './admin/prospamInputWait'
import taskGender from './taskGender'
import makeAdsRefInputWait from './admin/adsRef/makeAdsRefInputWait'
import adsRefMenu from './admin/adsRef/adsRefMenu'
import editAdsRef from './admin/adsRef/editAdsRef'
import deleteAdsRef from './admin/adsRef/deleteAdsRef'
import greetMenu from './admin/greet/greetMenu'
import greetEditTextInputWait from './admin/greet/greetEditTextInputWait'
import clearGreet from './admin/greet/clearGreet'
import rules from './rules'
import addChan from './admin/channels/addChan'
import setChanLinkInputWait from './admin/channels/setChanLinkInputWait'
import toggleChanChecking from './admin/channels/toggleChanChecking'
import removeChanLink from './admin/channels/removeChanLink'
import toggleOpChanTaskMode from './admin/channels/toggleOpChanTaskMode'
import setChanPriceInputWait from './admin/channels/setChanPriceInputWait'
import cubeGameMenu from './cubeGameMenu'
import duel from './duel'
import goDuel from './goDuel'
import confirmCashout from './admin/cashout/confirmCashout'
import cancelCashout from './admin/cashout/cancelCashout'
import manageUserInputWait from './admin/manageUserInputWait'
import adsRefOnlyUnique from './admin/adsRef/adsRefOnlyUnique'
import addOpSourceMenu from './admin/opSource/addOpSourceMenu'
import addOpSourceInputWait from './admin/opSource/addOpSourceInputWait'
import toggleOpSourceMode from './admin/opSource/toggleOpSourceMode'
import setOpSourcePriceInputWait from './admin/opSource/setOpSourcePriceInputWait'
import cancelDuel from './cancelDuel'
import pokazMenu from './admin/pokaz/pokazMenu'
import pokazEditTextInputWait from './admin/pokaz/pokazEditTextInputWait'
import clearPokaz from './admin/pokaz/clearPokaz'
import parseMessageBtns from '../utils/parseMessageBtns'
import mining from './mining'
import playCube from './playCube'

const ACTIONS = {
  gender: gender,
  taskGender: taskGender,

  checkOp: start,
  opEdit: opEdit,

  addChan: addChan,
  editChan: editChan,
  deleteChan: deleteChan,
  setChanLinkInputWait: setChanLinkInputWait,
  removeChanLink: removeChanLink,

  confirmCashout: confirmCashout,
  cancelCashout: cancelCashout,

  toggleChanChecking: toggleChanChecking,
  toggleOpChanTaskMode: toggleOpChanTaskMode,
  setChanPriceInputWait: setChanPriceInputWait,

  deleteOpLink: deleteOpLink,
  editOpSource: editOpSource,

  adminMenu: adminMenu,
  botStats: botStats,
  txtDump: txtDump,
  prospamInputWait: prospamInputWait,

  makeAdsRefInputWait: makeAdsRefInputWait,
  adsRefMenu: adsRefMenu,
  editAdsRef: editAdsRef,
  deleteAdsRef: deleteAdsRef,
  adsRefOnlyUnique: adsRefOnlyUnique,

  addOpSourceMenu: addOpSourceMenu,
  addOpSourceInputWait: addOpSourceInputWait,
  toggleOpSourceMode: toggleOpSourceMode,
  setOpSourcePriceInputWait: setOpSourcePriceInputWait,

  greetMenu: greetMenu,
  greetEditTextInputWait: greetEditTextInputWait,
  clearGreet: clearGreet,
  manageUserInputWait: manageUserInputWait,

  pokazMenu: pokazMenu,
  pokazEditTextInputWait: pokazEditTextInputWait,
  clearPokaz: clearPokaz,

  main_menu: start,
  profileInfo: profileInfo,
  getTasks: getTasks,

  topupMenu: topupMenu,
  cashoutMenu: cashoutMenu,

  cryptoBotInputWait: cryptoBotInputWait,
  checkCbInvoice: checkCbInvoice,
  deleteCbInvoice: deleteCbInvoice,

  starsTopUpInputWait: starsTopUpInputWait,
  starsTransferMenu: starsTransferMenu,

  starsCashoutMenu: starsCashoutMenu,
  starsCashout: starsCashout,

  boost: boost,
  cubeGameMenu: cubeGameMenu,
  duel: duel,
  goDuel: goDuel,
  cancelDuel: cancelDuel,

  rules: rules,
  mining: mining,

  playCube: playCube,
}

function isActionName(name: string): name is keyof typeof ACTIONS {
  return name in ACTIONS
}

export default async (ctx: Context) => {
  const { id } = ctx.from!

  const isPremium = ctx.from?.is_premium
  await updateLastActivity(id, isPremium)

  const user = await fetchUser({ id })

  try {
    await ctx.answerCallbackQuery()
    await ctx.deleteMessage()
  } catch (error) {}

  const { action, data } = parseCallback(ctx.callbackQuery?.data!)

  if (isActionName(action)) {
    await ACTIONS[action](ctx)
  }
  if (
    user.clicksCount > 0 &&
    user.clicksCount % 3 === 0 &&
    !user.is_admin
  ) {
    const { text } = await getPokazText({ adsMode: true })
    if (text && text !== 'none') {
      try {
        const { text: parsedText, keyboard } = parseMessageBtns(text)
        await ctx.reply(parsedText, {
          reply_markup: keyboard,
        })
      } catch (error) {
        console.error('Error showing pokaz:', error)
      }
    }
  }
}
