
type Nullable<T> = T | null | undefined;

export interface RsImzoClientEventMap {
  'ready': void;
  'sign_window_close': void;
}

export type RsImzoAction = 'signature_list' | 'sign' | 'ready' | 'parse_pkcs7'

export type RsImzoLocale = 'uz-kr' | 'uz' | 'ru' | 'en'

export interface RsImzoClientOptions {
  locale: RsImzoLocale
}

export interface RsImzoSignOptions {
  locale?: RsImzoLocale
  attached?: boolean
}

export interface RsImzoSignature {
  pin?: string
  tin?: string
  address: string
  country: string
  expireAt: number
  expireFrom: number
  fullName: string
  serial: string
  uid: string
  isLegalEntity: boolean
  orgName?: string
  isExpired: boolean
}

export interface RsImzoCallMethod {
  method: RsImzoAction
  data?: any
  targetWindow?: Window | null
}

export interface RsPostMessageResult<T> {
  error?: Nullable<PostMessageError>
  data?: Nullable<T>
  success?: boolean
}

export interface PostMessageError {
  errorCode: number;
  errorMessage: string;
}

export interface HandshakeOptions {
  retryDelay?: number
  timeout?: number
}