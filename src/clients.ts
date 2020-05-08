import { GraphQLClient } from './graphql-client'
import { SubscriptionClient } from './subscriptions-transport-ws'
import { GraphqlConfig, Options } from './types'
import { CustomWebSocket } from './CustomWebSocket'

const NULL_AS: any = null

async function waiting(func: (() => any)[]) {
  const fun = func.shift()
  if (fun) {
    await fun()
    waiting(func)
  }
}

const clients = {
  graphqlClient: NULL_AS as GraphQLClient,
  subscriptionClient: NULL_AS as SubscriptionClient,
  setupGraphqlClient(options: GraphqlConfig) {
    const { endpoint, errRetryCount = 0, timeout = 0 } = options
    const defaultOpt = { headers: {} }
    let opt: Options = options || defaultOpt
    clients.graphqlClient = new GraphQLClient({
      endpoint,
      headers: opt.headers as any,
      errRetryCount,
      timeout,
    })
  },

  async setupSubscriptionClient(options: GraphqlConfig) {
    const interceptor = options.subscriptionsInterceptor
    if (interceptor) {
      const { beforeRequests = [] } = interceptor
      await waiting(beforeRequests.slice())
    }

    const { subscriptionsEndpoint = '' } = options
    clients.subscriptionClient = new SubscriptionClient(
      subscriptionsEndpoint,
      {
        reconnect: true,
      },
      CustomWebSocket,
    )
  },
}
export default clients
