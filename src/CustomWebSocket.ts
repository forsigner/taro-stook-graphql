import Taro from '@tarojs/taro'

export class CustomWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  task: Taro.SocketTask

  set onclose(value: ((this: WebSocket, ev: CloseEvent) => any) | null) {
    this.task.onClose(value as any)
  }

  set onerror(value: any) {
    this.task.onError(value)
  }

  set onmessage(value: any) {
    this.task.onMessage(value)
  }
  set onopen(value: any) {
    this.task.onOpen(value)
  }

  get readyState() {
    return this.task.readyState
  }

  constructor(url: string) {
    Taro.connectSocket({
      url,
      protocols: ['graphql-ws'],
    }).then(task => {
      this.task = task
    })
  }

  close(code?: number, reason?: string) {
    this.task.close({ code, reason })
  }

  send(data: any) {
    this.task.send({ data })
  }
}
