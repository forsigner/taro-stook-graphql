import { useEffect } from '@tarojs/taro'
import { useStore } from 'taro-stook'
import gql from 'graphql-tag'
import { fetcher } from './fetcher'
import { graphqlConfig } from './config'
import { query } from './query'
import clients from './clients'
import { SubscribeResult, Interceptor, SubscriptionOption, QueryResult, FetcherItem } from './types'

export const subscriptions = {
  subscriptionsKeys: [] as string[],

  cleanAll: () => {
    subscriptions.subscriptionsKeys = []
  },
}

export function useSubscribe<T = any>(input: string, options: SubscriptionOption<T> = {}) {
  const { interceptor: configInterceptors } = graphqlConfig
  const { variables = {}, operationName = '', initialQuery = '', onUpdate } = options
  const fetcherName = options.key || input

  let unmounted = false
  let unsubscribe: () => void = () => {}
  let interceptor = {} as Interceptor
  const initialState = { loading: true } as SubscribeResult<T>
  const [result, setState] = useStore(fetcherName, initialState)

  if (configInterceptors) interceptor = configInterceptors

  function update(nextState: SubscribeResult<T>) {
    setState(nextState)
    onUpdate && onUpdate(nextState)
  }

  function updateInitialQuery(nextState: QueryResult<T>) {
    setState(nextState)
    if (options.initialQuery && options.initialQuery.onUpdate) {
      options.initialQuery.onUpdate(nextState)
    }
  }

  const initQuery = async () => {
    if (!initialQuery) return
    if (unmounted) return

    try {
      let data = await query<T>(initialQuery.query, { variables: initialQuery.variables || {} })
      updateInitialQuery({ loading: false, data } as QueryResult<T>)
      return data
    } catch (error) {
      updateInitialQuery({ loading: false, error } as QueryResult<T>)
      return error
    }
  }

  const fetchData = async () => {
    const instance = clients.subscriptionClient
      .request({
        query: gql`
          ${input}
        `,
        variables,
        operationName,
      })
      .subscribe({
        next({ data }) {
          if (interceptor.responses) {
            interceptor.responses.forEach(item => {
              data = item(data)
            })
          }

          update({ loading: false, data } as SubscribeResult<T>)
        },
        error(error) {
          update({ loading: false, error } as SubscribeResult<T>)
        },
        complete() {
          // console.log('completed')
        },
      })

    unsubscribe = instance.unsubscribe
    fetcher.set(fetcherName, { unsubscribe } as FetcherItem<T>)
  }

  useEffect(() => {
    if (initialQuery) initQuery()

    if (!unmounted) {
      const variablesString = JSON.stringify(variables)
      const subscription = `fetcherName_${fetcherName}variables_${variablesString}`
      if (subscriptions.subscriptionsKeys.indexOf(subscription) >= 0) return
      subscriptions.subscriptionsKeys.push(subscription)
      fetchData()
    }
    return () => {
      unmounted = true
    }
  }, [])

  return { ...result, unsubscribe }
}
