import { requestOpSubgram, checkUserSubscriptions } from '.'

console.log(
  JSON.stringify(
    await requestOpSubgram(6273715396, true, 'FastWalker', 'male')
  )
)

console.log(JSON.stringify(await checkUserSubscriptions(6273715396)))
