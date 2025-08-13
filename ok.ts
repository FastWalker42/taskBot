import fs from 'fs'
import path from 'path'
const inputFile = 'ids.txt'
const outputFile = 'filtered_ids.txt'

fs.readFile(inputFile, 'utf8', (err: any, data: string) => {
  if (err) {
    console.error('Ошибка при чтении файла:', err)
    return
  }

  // Разделяем строки (предполагается, что каждый ID на новой строке или разделен пробелом)
  const ids = data.trim().split(/\s+/)

  if (ids.length <= 30220) {
    console.error('Файл содержит меньше 30,220 ID!')
    return
  }

  // Удаляем первые 30,220 ID
  const filteredIds = ids.slice(30220)

  // Записываем в новый файл
  fs.writeFile(outputFile, filteredIds.join('\n'), (err: any) => {
    if (err) {
      console.error('Ошибка при записи файла:', err)
      return
    }
    console.log(
      `Успешно сохранено в ${outputFile}! Оставлено ${filteredIds.length} ID.`
    )
  })
})
