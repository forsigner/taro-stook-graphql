export interface Variables {
  [key: string]: any
}

export type Refetch = <T>(options?: Options) => Promise<T>

export type Deps = ReadonlyArray<any>

export interface Options {
  name?: string
  variables?: Variables
  deps?: Deps
  headers?: HeadersInit
}

export type Mutate = (variables: Variables, options?: Options) => any

export interface QueryResult<T> {
  loading: boolean
  data: T
  error: any
  refetch: Refetch
}

export interface MutateResult<T> {
  loading: boolean
  data: T
  error: any
}

export type RequestInterceptor = (config: Options) => any
export type RequestErrorInterceptor = (config: any) => any
export type ResponseInterceptor = (error: any) => any
export type ResponseErrorInterceptor = (error: any) => any

export interface Interceptor {
  requests?: RequestInterceptor[]
  requestErrors?: RequestErrorInterceptor[]
  responses?: ResponseInterceptor[]
  responseErrors?: ResponseErrorInterceptor[]
}

export interface GraphqlConfig {
  endpoint: string
  interceptor?: Interceptor
  headers?: HeadersInit
}

export interface Fetcher {
  [key: string]: {
    refetch: Refetch
  }
}
