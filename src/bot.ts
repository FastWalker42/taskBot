import CONFIG from '../CONFIG.json'
import { Bot } from 'grammy'
import { parseMode } from '@grammyjs/parse-mode'
import registerHandlers from './bot/handlers/index'

const IS_PROD_MODE = process.env.CONFIG_ENV === 'prod'
let TOKEN = CONFIG.BOT_TOKEN_TEST
if (IS_PROD_MODE) {
  TOKEN = CONFIG.BOT_TOKEN_PROD
}

const bot = new Bot(TOKEN)
bot.api.config.use(parseMode('HTML'))

registerHandlers(bot)

bot.init()

export default bot
