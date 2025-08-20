import { Context, InlineKeyboard, Keyboard } from 'grammy'
import {
  confirmUserOp,
  fetchUser,
  getGreetText,
  getTokenByUserId,
  updateState,
} from '../../db/methods'
import { STARS_PER_REF, HOST_URL, IMAGES } from '../../../CONFIG.json'
import topupMenu from './topup/topupMenu'
import getOpList from '../utils/getOpList'
import adminMenu from './admin/adminMenu'
import parseMessageBtns from '../utils/parseMessageBtns'

export default async (ctx: Context) => {
  try {
    if (['ar', 'hi'].includes(ctx.from?.language_code!)) {
      await ctx.reply('Region not allowed')
      return
    }

    const { id } = ctx.from!
    const startPayload = ctx.message?.text?.split(' ')[1]

    let userExisted
    try {
      userExisted = await fetchUser({ id }, startPayload)
      console.log('[userExisted]', userExisted)
    } catch (err) {
      console.error('[fetchUser error]', err)
    }

    try {
      await updateState(id, 'none')
    } catch (err) {
      console.error('[updateState error]', err)
    }

    if (ctx.message?.text === '/start topup') {
      try {
        await ctx.deleteMessage()
        await topupMenu(ctx)
        return
      } catch (err) {
        console.error('[topupMenu error]', err)
      }
    }

    let opList: any[] = []
    try {
      opList = await getOpList(ctx)
      console.log('[opList]', opList)
    } catch (err) {
      console.error('[getOpList error]', err)
    }

    if (opList.length > 0 && !userExisted?.is_admin) {
      try {
        const kb = new InlineKeyboard()
        for (let i = 0; i < opList.length; i++) {
          const opChan = opList[i]
          kb.url(opChan.name ?? 'Имя', opChan.url ?? 'none')
          if ((i + 1) % 3 === 0) kb.row()
        }
        kb.row().text('✅ ПРОДОЛЖИТЬ', 'checkOp')

        await ctx.replyWithPhoto(IMAGES.OP, {
          caption: `
<b>👋 Добро пожаловать!</b>
<blockquote>‼️ Подпишитесь на спонсоров, чтобы ЗАБРАТЬ ПОДАРОК 🎁 и начать получать БЕСПЛАТНЫЕ ЗВЕЗДЫ ⭐️, а затем нажмите <b>"✅ ПРОДОЛЖИТЬ"</b></blockquote>`,
          reply_markup: kb,
        })
      } catch (err) {
        console.error('[opList photo error]', err)
      }
    } else {
      try {
        if (opList.length === 0) {
          await confirmUserOp(id)
        }

        const userToken = await getTokenByUserId(id)

        await ctx.replyWithPhoto(IMAGES.START, {
          caption: `<b>✨ Добро пожаловать!</b>
<blockquote>☁️ В этом боте вы можете получать старсы за простые задания!</blockquote>

<b>🔗💕 Приглашйте друзей по своей реф.ссылке</b> 
(нажмите чтобы скопировать)
<code>t.me/Vipstars_freebot?start=${id}</code>
<blockquote><b>⭐️ ${STARS_PER_REF} за каждого реферала!</b></blockquote>`,
          reply_markup: new InlineKeyboard()
            .text('💎 МАЙНИНГ ⭐️⛏', 'mining')
            .text('🎲 Кубик', 'cubeGameMenu')
            .row()
            .text('👤 Профиль', 'profileInfo')
            .text('📝 Задания', 'getTasks')
            .row()
            .webApp(
              '🎰 РУЛЕТКА УДАЧИ ☘️⭐️',
              `${HOST_URL}?botUsername=Vipstars_freebot&token=${userToken}`
            )
            .row()
            .text('🔫 ДУЭЛЬ 🆕', 'duel')
            //.row().text('🎲 Бросить кубик', 'cubeGameMenu')
            .row()
            .text('📤 Вывод 💰', 'cashoutMenu')
            .row()
            .text('❓ Правила', 'rules')
            .row(),
        })

        if (!userExisted?.gender) {
          await ctx.reply(
            '❗️Пожалуйста, укажите свой пол. Это важно для подбора заданий',
            {
              reply_markup: new InlineKeyboard()
                .text('🙎‍♂️ Мужской', 'gender-male')
                .text('🙍‍♀️ Женский', 'gender-female'),
            }
          )
        }

        if (
          (ctx.msg?.text && ctx.msg.text.startsWith('/start')) ||
          ctx.callbackQuery?.data === 'checkOp'
        ) {
          const greetText = await getGreetText()
          if (greetText !== 'none') {
            const { text, keyboard } = parseMessageBtns(greetText)
            await ctx.reply(text, { reply_markup: keyboard })
          }
        }
      } catch (err) {
        console.error('[main flow error]', err)
      }
    }

    if (userExisted?.is_admin) {
      try {
        await ctx.reply('⚙️ Меню админа', {
          reply_markup: new Keyboard().requestChat(
            '📌🔰 Добавить ВЕРИФ канал в ОП',
            0,
            {
              chat_is_channel: true,
            }
          ),
        })
        await adminMenu(ctx)
      } catch (err) {
        console.error('[adminMenu error]', err)
      }
    }
  } catch (globalErr) {
    console.error('[UNCAUGHT ERROR IN START]', globalErr)
  }
}
