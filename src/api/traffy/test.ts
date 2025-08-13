import { getTraffyTasks, checkSubscriptionTraffy } from './index'

const resourceId = '97d6ee9c-5fd0-4496-a6c5-9a2600b2479c' // Замените на ваш resource_id из Traffy
const telegramChatId = '6273715396'

console.log(await getTraffyTasks(telegramChatId))
