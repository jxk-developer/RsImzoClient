import { AsyncEventEmitter } from './EventEmitter'
import { RsPostMessageResult, RsImzoCallMethod, RsImzoClientEventMap, RsImzoClientOptions, RsImzoLocale, RsImzoSignOptions, RsImzoSignature, HandshakeOptions } from 'src/types'

export class Client extends AsyncEventEmitter<RsImzoClientEventMap> {
  private providerIframe: HTMLIFrameElement | null = null
  private readonly iframeProviderId = 'rs-imzo-provider-iframe'
  private readonly targetOrigin = 'http://localhost:3030'
  private readonly providerPath = `/provider`
  private readonly signPath = `${this.providerPath}/sign`

  locale: RsImzoLocale = 'en'

  constructor(options?: RsImzoClientOptions) {
    super()

    this.locale = options?.locale || this.locale

    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init(): void {
    if (!window) {
      return console.error('RsImzoClient: window is not available')
    }

    if (document.readyState === 'complete') {
      this.appendProviderIframe()
    } else {
      window.addEventListener(
        'load',
        this.appendProviderIframe.bind(this),
        { once: true }
      )
    }
  }

  private async appendProviderIframe(): Promise<void> {
    const existingIframe = document.getElementById(this.iframeProviderId) as HTMLIFrameElement | null
    if (existingIframe) {
      this.providerIframe = existingIframe
    } else {
      this.providerIframe = document.createElement('iframe')
      this.providerIframe.id = this.iframeProviderId
      this.providerIframe.src = this.buildUrl(this.providerPath)
      this.providerIframe.style.display = 'none'

      document.body.appendChild(this.providerIframe)
    }


    if (await this.checkWindowLoadedViaHandshake(this.providerIframe!.contentWindow!)) {
      await this.emit('ready')
    }
  }

  public async callMethod<T>({ method, data, targetWindow }: RsImzoCallMethod): Promise<RsPostMessageResult<T>> {
    if (typeof window === 'undefined' || !targetWindow) {
      console.error('callMethod: Environment or target window not available.')
      return { data: null, error: null }
    }

    return new Promise((resolve, reject) => {
      try {
        const channel = new MessageChannel()
        channel.port1.onmessage = (event: MessageEvent<RsPostMessageResult<T>>) => {
          if (!event.data) {
            console.log('callMethod: event.data is not available')
            reject({ data: null, error: null })
          }
          resolve(event.data)
        }
        targetWindow.postMessage({ method, data }, this.targetOrigin, [channel.port2])
      } catch (e) {
        console.error('callMethod error: ', e)
        reject({ data: null, error: null })
      }
    })
  }

  public async getSignatures() {
    return this.callMethod<RsImzoSignature[]>({ method: 'signature_list', targetWindow: this.providerIframe?.contentWindow })
  }

  public async parsePkcs7(pkcs12: string) {
    return this.callMethod<string>({ method: 'parse_pkcs7', data: { pkcs12 }, targetWindow: this.providerIframe?.contentWindow })
  }

  public async sign(serialNumber: string, content: string, options?: RsImzoSignOptions) {
    const signWindow = await this.openWindow(this.buildUrl(this.signPath, options?.locale), 'RsSign', 280, 320)

    const windowClosedPromise: Promise<{ data: null, error: null }> = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (signWindow.closed) {
          this.emit('sign_window_close')
          clearInterval(interval)
          resolve({ data: null, error: null })
        }
      }, 500)
    })

    const dataPromise = this.callMethod<string>({
      method: 'sign',
      targetWindow: signWindow,
      data: { serialNumber, content, attached: options?.attached }
    })

    // Wait for either the window to close or the data to be returned
    const result = await Promise.race([windowClosedPromise, dataPromise])

    // Ensure the signWindow is closed
    if (!signWindow.closed) {
      signWindow.close()
    }

    return result
  }

  private openWindow(url: any, title: any, w: any, h: any): Promise<Window> {
    const left = (screen.width / 2) - (w / 2) + window.screenLeft
    const top = (screen.height * 0.2) + window.screenTop

    return new Promise(async (resolve, reject) => {
      try {
        const newWindow = window.open(url, title, `
          width=${w},
          height=${h},
          top=${top},
          left=${left},
          scrollbars=no,
          resizable=no`)

        if (!newWindow) {
          console.error('newWindow is not initialized')
          return reject(new Error('newWindow is not initialized'))
        }

        if (await this.checkWindowLoadedViaHandshake(newWindow)) {
          newWindow.focus()
          resolve(newWindow)
        }

      } catch (e) {
        reject(new Error(`openWindow err ${e}`))
      }
    })
  }

  private checkWindowLoadedViaHandshake(window: Window, options: HandshakeOptions = {}): Promise<boolean> {
    const { retryDelay = 200, timeout = 10000 } = options
    const callTotal = Math.floor(timeout / retryDelay)
    let callCount = 0

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const { data } = await this.callMethod<boolean>({ method: 'ready', targetWindow: window })
        if (data) {
          clearInterval(interval)
          resolve(data)
        }
        if (callCount >= callTotal) {
          clearInterval(interval)
          resolve(false)
        }
        callCount++
      }, retryDelay)
    })
  }

  private buildUrl(path: string, locale?: RsImzoLocale): string {
    const l = locale || this.locale
    return `${this.targetOrigin}${l === 'uz' ? '' : `/${l}`}${path}`
  }

  public cleanup(): void {
    if (this.providerIframe && this.providerIframe.parentElement) {
      this.providerIframe.parentElement.removeChild(this.providerIframe)
      this.providerIframe = null
    }
  }
}
