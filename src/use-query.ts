import { useEffect, useRef } from '@tarojs/taro'
import { useStore, Storage } from 'taro-stook'
import isEqual from 'react-fast-compare'
import { query } from './query'
import { fetcher } from './fetcher'
import {
  Options,
  QueryResult,
  Refetch,
  FetcherItem,
  Variables,
  Deps,
  Start,
  RefetchOptions,
} from './types'

function getDeps(options?: Options): Deps {
  if (options && Array.isArray(options.deps)) return options.deps
  return []
}

export function useQuery<T = any>(input: string, options: Options<T> = {}) {
  const { initialData: data, onUpdate = false, pollInterval, lazy = false } = options
  const fetcherName = options.key || input

  let unmounted = false
  const deps = getDeps(options)
  const initialState = { loading: true, data } as QueryResult<T>
  const [result, setState] = useStore(fetcherName, initialState)

  function update(nextState: QueryResult<T>) {
    setState(nextState)
    onUpdate && onUpdate(nextState)
  }

  function getFetchVariables(opt: Options = {}): Variables {
    if (!opt.variables) return fetcher.get(fetcherName).variables || {}
    if (typeof opt.variables === 'function') {
      return opt.variables(fetcher.get(fetcherName).variables)
    }
    return opt.variables
  }

  const makeFetch = async (opt = {} as RefetchOptions, isRefetch = false) => {
    if (!isRefetch && unmounted) return

    // 如果不是 refetch，并且 called，那就不发请求，防止多个组件使用同一个 hooks 引起多次请求
    if (!isRefetch && fetcher.get(fetcherName).called) return

    try {
      // TODO: 处理Loading装填
      // if (!isRefetch) {
      //   update({ loading: true } as QueryResult<T>)
      // }

      fetcher.get(fetcherName).called = true
      const resData = await query<T>(input, opt || {})
      setState(state => {
        state.loading = false
        if (opt.setData && typeof opt.setData === 'function') {
          opt.setData(state.data, resData)
        } else {
          state.data = resData
        }
        onUpdate && onUpdate(state)
      })
      return resData
    } catch (error) {
      update({ loading: false, error } as QueryResult<T>)
      return error
    }
  }

  const refetch: Refetch = async <P = any>(opt = {} as RefetchOptions): Promise<P> => {
    opt.variables = getFetchVariables(opt)
    // store variables to fetcher
    fetcher.get(fetcherName).variables = opt.variables

    const refetchedData: any = await makeFetch(opt, true)
    return refetchedData as P
  }

  const getVariables = (opt: Options): Variables | null => {
    if (!opt.variables) return {}
    if (typeof opt.variables !== 'function') return opt.variables
    try {
      // TODO: handle variables params
      return opt.variables({})
    } catch (error) {
      return null
    }
  }

  // 变量ref
  const variablesRef = useRef<Variables | null>(getVariables(options))

  // 变量已经改变
  if (!isEqual(variablesRef.current, getVariables(options))) {
    variablesRef.current = getVariables(options)
  }

  let timer: any = null

  useEffect(() => {
    // store refetch fn to fetcher
    if (!fetcher.get(fetcherName)) {
      fetcher.set(fetcherName, { refetch, called: false } as FetcherItem<T>)
    }

    // 不等于 null, 说明已经拿到最终的 variables
    if (variablesRef.current !== null && !lazy) {
      // store variables to fetcher
      fetcher.get(fetcherName).variables = variablesRef.current

      makeFetch({ ...options, variables: variablesRef.current } as any)

      if (pollInterval && !fetcher.get(fetcherName).polled) {
        fetcher.get(fetcherName).polled = true
        /** pollInterval */
        timer = setInterval(() => {
          makeFetch({ ...options, variables: variablesRef.current } as any, true)
        }, pollInterval)
      }
    }

    return () => {
      unmounted = true

      if (timer) {
        clearInterval(timer)
        fetcher.get(fetcherName).polled = false
      }

      // 全部 unmount，设置 called false
      const store = Storage.get(fetcherName)
      if (store && store.setters.length === 0) {
        fetcher.get(fetcherName).called = false

        // TODO: 要为true ?
        update({ loading: true } as any)
      }
    }
  }, [...deps, variablesRef.current])

  const start: Start = async <P = any>(): Promise<P> => {
    // store variables to fetcher
    fetcher.get(fetcherName).variables = variablesRef.current || {}
    const resData: any = await makeFetch({
      ...options,
      variables: variablesRef.current || {},
    } as any)
    return resData as P
  }

  const fetcherInstance = fetcher.get(fetcherName)
  // TODO: 需要优化
  if (fetcherInstance) {
    fetcherInstance.start = start
    fetcherInstance.refetch = refetch
  } else {
    fetcher.set(fetcherName, { start } as any)
  }

  const called = fetcher.get(fetcherName) && fetcher.get(fetcherName).called

  return { ...result, refetch, start, called }
}
