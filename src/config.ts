import { GraphqlConfig } from './types'
import clients from './clients'

export let graphqlConfig = {
  endpoint: '',
} as GraphqlConfig

export function config(options: GraphqlConfig) {
  graphqlConfig = { ...graphqlConfig, ...options }
  clients.setupGraphqlClient(graphqlConfig)
  clients.setupSubscriptionClient(graphqlConfig)
}
