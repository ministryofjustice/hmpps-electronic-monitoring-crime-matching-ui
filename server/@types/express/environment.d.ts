// eslint-disable-next-line  import/prefer-default-export
export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production' | 'e2e-test'
      PORT?: string
      REDIS_PORT: string
    }
  }
}
