export interface Variables {
  [key: string]: any
}

/**
 * 如何更新 data
 */
export type SetData<T> = (data: T, newData: T) => void
export interface RefetchOptions<T = any> extends Options<T> {
  showLoading?: boolean
  setData?: SetData<T>
}
export type Refetch = <T>(options?: RefetchOptions) => Promise<T>
export type Start = <T>() => Promise<T>

export type Deps = ReadonlyArray<any>

export interface Options<T = any> {
  key?: string
  variables?: Variables | ((prevVariables: Variables) => Variables)
  deps?: Deps
  headers?: HeadersInit
  initialData?: T
  pollInterval?: number
  onUpdate?(result: Result<T>): any
  lazy?: boolean
  errRetryCount?: number // 错误重试次数
  timeout?: number // 超时时间(单位毫秒)
}

export type Mutate = (variables: Variables, options?: Options) => any

export interface FetcherItem<T = any> {
  refetch: Refetch
  start: Start
  unsubscribe: () => void
  result: Result<T>
  variables: Variables
  called: boolean
  polled: boolean
}

export interface Fetcher<T = any> {
  [key: string]: FetcherItem<T>
}

export interface Result<T = any> {
  loading: boolean
  data: T
  error: any
}

export interface QueryResult<T> extends Result<T> {
  refetch: Refetch
  start: Start
  called: boolean
}

export interface MutateResult<T> extends Result<T> {}

export interface SubscribeResult<T> extends Result<T> {
  unsubscribe?: () => void
}

export type BeforeRequestInterceptor = () => any
export type RequestInterceptor = (config: Options, input?: string) => any
export type RequestErrorInterceptor = (config: any, input?: string) => any
export type ResponseInterceptor = (error: any, input?: string, config?: Options) => any
export type ResponseErrorInterceptor = (error: any, input?: string, config?: Options) => any

export interface Interceptor {
  beforeRequests?: BeforeRequestInterceptor[]
  requests?: RequestInterceptor[]
  requestErrors?: RequestErrorInterceptor[]
  responses?: ResponseInterceptor[]
  responseErrors?: ResponseErrorInterceptor[]
}

export interface subscriptionsInterceptor {
  beforeRequests?: BeforeRequestInterceptor[]
  requests?: RequestInterceptor[]
  requestErrors?: RequestErrorInterceptor[]
  responses?: ResponseInterceptor[]
  responseErrors?: ResponseErrorInterceptor[]
}

export interface GraphqlConfig {
  endpoint: string
  subscriptionsEndpoint?: string
  interceptor?: Interceptor
  subscriptionsInterceptor?: subscriptionsInterceptor
  headers?: HeadersInit
  timeout?: number
  errRetryCount?: number
}

export interface SubscriptionOption<T = any> {
  key?: string
  variables?: Object
  operationName?: string
  initialQuery?: {
    query: string
    variables?: Variables | (() => Variables)
    onUpdate?(result: Result<T>): any
  }
  onUpdate?(result: Result<T>): any
}

export interface FromSubscriptionOption {
  variables?: Object
}
