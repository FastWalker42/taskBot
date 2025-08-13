export default (data: string): { action: string; data: string } => {
  const [action, ...rest] = data.split('-')
  return {
    action,
    data: rest.join('-'),
  }
}
