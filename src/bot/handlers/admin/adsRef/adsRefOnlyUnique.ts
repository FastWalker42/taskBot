import { Context, InlineKeyboard, Keyboard } from 'grammy'
import parseCallBack from '../../../utils/parseCallBack'
import {
  getAllAdsRefs,
  toggleAdsRefShowOnlyUnique,
} from '../../../../db/methods'
import editAdsRef from './editAdsRef'

export default async (ctx: Context) => {
  const adsRefPayload = parseCallBack(ctx.callbackQuery?.data!).data

  await toggleAdsRefShowOnlyUnique(adsRefPayload)
  await editAdsRef(ctx)
}
