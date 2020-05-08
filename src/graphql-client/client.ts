import { request } from '../request'
import { Options, Variables, Headers } from './typings'
import { graphqlConfig } from '../config'

export interface QueryOptions {
  headers?: Headers
  timeout?: number
  errRetryCount?: number
}

export class GraphQLClient {
  constructor(private readonly options: Options) {}

  async query<T = any>(
    input: string,
    variables: Variables = {},
    options: QueryOptions = {},
  ): Promise<T> {
    const { headers: queryOptionsHeaders, timeout = 0, errRetryCount = 0 } = options
    const {
      endpoint,
      headers: optionsHeaders,
      timeout: optionsTimeout,
      errRetryCount: optionsErrRetryCount,
    } = { ...this.options, ...graphqlConfig }
    const body = { query: input, variables }
    try {
      const res = await request(endpoint, {
        method: 'POST',
        body,
        headers: { ...optionsHeaders, ...queryOptionsHeaders },
        timeout: timeout || optionsTimeout,
        errRetryCount: errRetryCount || optionsErrRetryCount,
      })
      if (res.data) return res.data
      throw res
    } catch (error) {
      throw error
    }
  }
}

export async function query<T = any>(
  endpoint: string,
  input: string,
  variables?: Variables,
  options?: QueryOptions,
): Promise<T> {
  const client = new GraphQLClient({ endpoint })
  return client.query<T>(input, variables, options)
}
