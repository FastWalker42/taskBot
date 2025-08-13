export default (text?: string): [string, string?] => {
  if (!text) return ['start']
  const [command, payload] = text.trim().split(' ')
  return [command.replace('/', ''), payload]
}
