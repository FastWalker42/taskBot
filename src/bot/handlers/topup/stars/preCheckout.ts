import { Context } from 'grammy'

export default async (ctx: Context) => {
  ctx.answerPreCheckoutQuery(true)
}
