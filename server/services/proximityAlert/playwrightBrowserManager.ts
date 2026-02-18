import { chromium, type Browser } from 'playwright'
import logger from '../../../logger'

export default class PlaywrightBrowserService {
  private browser?: Browser

  private launching?: Promise<Browser>

  async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser
    if (this.launching) return this.launching

    this.launching = (async () => {
      logger.info('[playwright] launching shared browser')
      const chromiumBrowser = await chromium.launch({ headless: true })
      this.browser = chromiumBrowser
      this.launching = undefined
      return chromiumBrowser
    })()

    return this.launching
  }

  async close(): Promise<void> {
    if (!this.browser) return
    logger.info('[playwright] closing shared browser')
    await this.browser.close()
    this.browser = undefined
  }
}
