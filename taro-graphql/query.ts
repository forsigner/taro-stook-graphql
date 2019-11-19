import { GraphQLClient } from './graphql-client'
import { graphqlConfig } from './config'
import { Options, Variables } from './types'
import { Interceptor } from './types'

export const query = async <T = any>(input: string, options?: Options) => {
  const defaultOpt = { headers: {} }
  let opt: Options = options || defaultOpt
  let interceptor = {} as Interceptor
  const { endpoint, interceptor: configInterceptors } = graphqlConfig
  const variables: Variables = opt.variables || {}

  if (configInterceptors) interceptor = configInterceptors

  if (interceptor.requests) {
    interceptor.requests.forEach(item => {
      opt = item(opt) || {}
    })
  }

  try {
    const client = new GraphQLClient({ endpoint, headers: opt.headers as any })
    let res = await client.query<T>(input, variables)
    if (interceptor.responses) {
      interceptor.responses.forEach(item => {
        res = item(res)
      })
    }
    return res
  } catch (error) {
    throw error
  }
}
