import { Context } from 'grammy'
import gender from './gender'
import { getTasks } from './tasks'

export default async (ctx: Context) => {
  await gender(ctx)
  await getTasks(ctx)
}
