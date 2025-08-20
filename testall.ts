import { writeFile } from 'fs/promises'
import { User } from './src/db/init' // путь к твоему файлу с getAllUsers

export const getAllUsers = async (): Promise<number[]> => {
  const users = await User.find({}, { id: 1, _id: 0 }).lean()
  const uniqueUsersSet = new Set<number>(
    users.map((u) => Number(u.id))
  )
  return Array.from(uniqueUsersSet)
}

async function testGetAllUsers() {
  const allUsers = await getAllUsers()
  console.log(`Всего пользователей: ${allUsers.length}`)

  // Сохраняем весь массив в JSON
  await writeFile('allUsers.json', JSON.stringify(allUsers, null, 2))
  console.log('Список всех пользователей сохранён в allUsers.json')
}

testGetAllUsers().catch(console.error)
