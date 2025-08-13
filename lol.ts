import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Получаем __dirname в ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url))

function reverseNumbersInFile(filePath: string): void {
  try {
    // Чтение содержимого файла
    const content = readFileSync(filePath, 'utf-8')

    // Разделение чисел по пробелам и фильтрация пустых строк
    const numbers = content
      .split(/\s+/)
      .filter((num) => num.trim() !== '')

    // Разворот массива чисел
    const reversedNumbers = [...numbers].reverse()

    // Объединение обратно в строку с пробелами
    const reversedContent = reversedNumbers.join(' ')

    // Запись обратно в файл
    writeFileSync(filePath, reversedContent, 'utf-8')

    console.log(`Порядок чисел в файле успешно развёрнут.`)
  } catch (error) {
    console.error(
      `Ошибка при обработке файла: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

// Пример использования (замените на путь к вашему файлу)
const filePath = join(__dirname, 'ids2.txt')
reverseNumbersInFile(filePath)
