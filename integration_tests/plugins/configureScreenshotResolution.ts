const configureScreenshotResolution = (on: Cypress.PluginEvents) => {
  on('before:browser:launch', (browser: Cypress.Browser, launchOptions) => {
    // eslint-disable-next-line no-console
    console.log('launching browser %s is headless? %s', browser.name, browser.isHeadless)

    // the browser width and height we want to get
    // our screenshots and videos will be of that resolution
    const width = 1920
    const height = 1080

    // eslint-disable-next-line no-console
    console.log('setting the browser window size to %d x %d', width, height)

    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push(`--window-size=${width},${height}`)

      // force screen to be non-retina and just use our given resolution
      launchOptions.args.push('--force-device-scale-factor=1')
    }

    if (browser.name === 'electron' && browser.isHeadless) {
      // eslint-disable-next-line no-param-reassign
      launchOptions.preferences.width = width
      // eslint-disable-next-line no-param-reassign
      launchOptions.preferences.height = height
    }

    if (browser.name === 'firefox' && browser.isHeadless) {
      launchOptions.args.push(`--width=${width}`)
      launchOptions.args.push(`--height=${height}`)
    }

    return launchOptions
  })
}

export default configureScreenshotResolution
