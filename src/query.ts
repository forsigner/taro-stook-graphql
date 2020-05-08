import clients from './clients'
import { graphqlConfig } from './config'
import { Options, Interceptor } from './types'

async function waiting(func: (() => any)[]) {
  const fun = func.shift()
  if (fun) {
    await fun()
    waiting(func)
  }
}

export const query = async <T = any>(input: string, options: Options = {}): Promise<any> => {
  const { variables = {}, errRetryCount = 0, timeout = 0 } = options
  let interceptor = {} as Interceptor
  const { interceptor: configInterceptors } = graphqlConfig

  if (configInterceptors) interceptor = configInterceptors

  try {
    const { beforeRequests = [] } = interceptor
    await waiting(beforeRequests.slice())

    if (interceptor.requests) {
      interceptor.requests.forEach(item => {
        options = item(options, input) || {}
      })
    }

    let res = await clients.graphqlClient.query<T>(input, variables, {
      headers: options.headers || ({} as any),
      timeout,
      errRetryCount,
    })
    if (interceptor.responses) {
      interceptor.responses.forEach(item => {
        res = item(res, input, options)
      })
    }
    return res
  } catch (error) {
    if (interceptor.responseErrors) {
      interceptor.responseErrors.forEach(item => {
        item(error, input, options)
      })
    }

    throw error
  }
}
