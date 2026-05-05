import MapImageRendererService from './proximityAlertMapImageService'

describe('MapImageRendererService', () => {
  const capturedMapState = JSON.stringify({
    mapWidthPx: 1200,
    mapHeightPx: 800,
    devicePixelRatio: 2,
    view: {
      center: [12345, 67890],
      resolution: 4.5,
      rotation: 0,
    },
  })

  const createMockPage = () => {
    // Fake screenshot buffers to be returned by the mocked map element's screenshot method
    const screenshotBuffers = [
      Buffer.from('overview-user-view'),
      Buffer.from('device-wearer-with-tracks-1'),
      Buffer.from('device-wearer-with-tracks-2'),
      Buffer.from('overview-fitted-to-device-wearers'),
      Buffer.from('device-wearer-fitted-without-tracks-1'),
      Buffer.from('device-wearer-fitted-without-tracks-2'),
    ]

    // Mock the map element with a screenshot method that returns predefined buffers
    const mapElement = {
      screenshot: jest.fn().mockImplementation(() => Promise.resolve(screenshotBuffers.shift())),
    }

    // Mock the page with the necessary methods for the service to interact with
    const page = {
      evaluate: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      setDefaultTimeout: jest.fn(),
      setDefaultNavigationTimeout: jest.fn(),
      $: jest.fn().mockResolvedValue(mapElement),
    }

    return { page, mapElement }
  }

  // Mock the browser context that returns the mock page when newPage is called
  const createMockContext = (page: ReturnType<typeof createMockPage>['page']) => {
    return {
      addCookies: jest.fn().mockResolvedValue(undefined),
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn().mockResolvedValue(undefined),
    }
  }

  // Mock browser that returns the mock context when newContext is called
  const createMockBrowser = (context: ReturnType<typeof createMockContext>) => {
    return {
      newContext: jest.fn().mockResolvedValue(context),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all report images and closes the browser context', async () => {
    const { page, mapElement } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    const result = await service.render({
      browser: browser as never,
      pageUrl: 'https://example.test/proximity-alert/123',
      baseUrlForCookies: 'https://example.test',
      cookieHeader: 'connect.sid=fake-session; foo=bar',
      selectedDeviceIds: ['1', '2'],
      selectedTrackDeviceIds: ['1'],
      capturedMapState,
      showConfidenceCircles: false,
      showLocationNumbering: true,
    })

    expect(browser.newContext).toHaveBeenCalledWith({
      viewport: {
        width: 1200,
        height: 650,
      },
    })

    expect(context.addCookies).toHaveBeenCalledWith([
      { name: 'connect.sid', value: 'fake-session', url: 'https://example.test' },
      { name: 'foo', value: 'bar', url: 'https://example.test' },
    ])

    expect(page.setDefaultTimeout).toHaveBeenCalledWith(30_000)
    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(30_000)

    expect(page.goto).toHaveBeenCalledWith(
      'https://example.test/proximity-alert/123?headless=true&mapWidthPx=1200&mapHeightPx=800&selectedDeviceIds=1%2C2',
      { waitUntil: 'domcontentloaded' },
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [1, 2],
          selectedTrackDeviceIds: [1],
          showConfidenceCircles: false,
          showLocationNumbering: true,
          fitMode: 'none',
          capturedMapState: {
            mapWidthPx: 1200,
            mapHeightPx: 800,
            devicePixelRatio: 2,
            view: {
              center: [12345, 67890],
              resolution: 4.5,
              rotation: 0,
            },
          },
        }),
      }),
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [1],
          selectedTrackDeviceIds: [1],
          focusedDeviceId: 1,
          fitMode: 'none',
        }),
      }),
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [2],
          selectedTrackDeviceIds: [2],
          focusedDeviceId: 2,
          fitMode: 'none',
        }),
      }),
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [1, 2],
          selectedTrackDeviceIds: [],
          showConfidenceCircles: true,
          showLocationNumbering: true,
          fitMode: 'selected-device-wearers',
        }),
      }),
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [1],
          selectedTrackDeviceIds: [],
          focusedDeviceId: 1,
          fitMode: 'focused-device-wearer',
        }),
      }),
    )

    expect(page.evaluate).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        renderConfig: expect.objectContaining({
          selectedDeviceIds: [2],
          selectedTrackDeviceIds: [],
          focusedDeviceId: 2,
          fitMode: 'focused-device-wearer',
        }),
      }),
    )

    expect(mapElement.screenshot).toHaveBeenCalledTimes(6)

    expect(result).toEqual({
      overviewUserViewJpg: Buffer.from('overview-user-view'),
      overviewFittedToDeviceWearersJpg: Buffer.from('overview-fitted-to-device-wearers'),
      deviceWearerWithTracksJpgByDeviceId: {
        '1': Buffer.from('device-wearer-with-tracks-1'),
        '2': Buffer.from('device-wearer-with-tracks-2'),
      },
      deviceWearerFittedWithoutTracksJpgByDeviceId: {
        '1': Buffer.from('device-wearer-fitted-without-tracks-1'),
        '2': Buffer.from('device-wearer-fitted-without-tracks-2'),
      },
    })

    expect(context.close).toHaveBeenCalled()
  })

  it('throws when cookieHeader is not provided', async () => {
    const { page } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    await expect(
      service.render({
        browser: browser as never,
        pageUrl: 'https://example.test/proximity-alert/123',
        baseUrlForCookies: 'https://example.test',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        capturedMapState,
        showConfidenceCircles: true,
        showLocationNumbering: true,
      }),
    ).rejects.toThrow('cookieHeader is required to render proximity alert report images')

    expect(browser.newContext).not.toHaveBeenCalled()
  })

  it('throws when cookieHeader does not contain any valid cookies', async () => {
    const { page } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    await expect(
      service.render({
        browser: browser as never,
        pageUrl: 'https://example.test/proximity-alert/123',
        baseUrlForCookies: 'https://example.test',
        cookieHeader: '   ;   ',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        capturedMapState,
        showConfidenceCircles: true,
        showLocationNumbering: true,
      }),
    ).rejects.toThrow('cookieHeader must contain at least one valid cookie to render proximity alert report images')

    expect(browser.newContext).toHaveBeenCalledWith({
      viewport: {
        width: 1200,
        height: 650,
      },
    })
    expect(context.addCookies).not.toHaveBeenCalled()
    expect(context.close).toHaveBeenCalled()
  })

  it('throws when capturedMapState is not provided', async () => {
    const { page } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    await expect(
      service.render({
        browser: browser as never,
        pageUrl: 'https://example.test/proximity-alert/123',
        baseUrlForCookies: 'https://example.test',
        cookieHeader: 'connect.sid=fake-session; foo=bar',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        showConfidenceCircles: true,
        showLocationNumbering: true,
      }),
    ).rejects.toThrow('capturedMapState is required and must be valid to render proximity alert report images')

    expect(browser.newContext).not.toHaveBeenCalled()
  })

  it('throws when capturedMapState is invalid', async () => {
    const { page } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    await expect(
      service.render({
        browser: browser as never,
        pageUrl: 'https://example.test/proximity-alert/123',
        baseUrlForCookies: 'https://example.test',
        cookieHeader: 'connect.sid=fake-session; foo=bar',
        selectedDeviceIds: ['1'],
        selectedTrackDeviceIds: ['1'],
        capturedMapState: '{invalid-json}',
        showConfidenceCircles: true,
        showLocationNumbering: true,
      }),
    ).rejects.toThrow('capturedMapState is required and must be valid to render proximity alert report images')

    expect(browser.newContext).not.toHaveBeenCalled()
  })

  it('still closes the browser context when rendering fails', async () => {
    const { page } = createMockPage()
    const context = createMockContext(page)
    const browser = createMockBrowser(context)
    const service = new MapImageRendererService()

    page.$ = jest.fn().mockResolvedValue(null)

    await expect(
      service.render({
        browser: browser as never,
        pageUrl: 'https://example.test/proximity-alert/123',
        baseUrlForCookies: 'https://example.test',
        cookieHeader: 'connect.sid=fake-session; foo=bar',
        selectedDeviceIds: [],
        selectedTrackDeviceIds: [],
        capturedMapState,
        showConfidenceCircles: true,
        showLocationNumbering: true,
      }),
    ).rejects.toThrow('Map element <em-map> not found for screenshot')

    expect(context.close).toHaveBeenCalled()
  })
})
