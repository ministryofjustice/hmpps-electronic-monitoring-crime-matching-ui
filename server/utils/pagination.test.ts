import pagination from './pagination'

describe('pagination', () => {
  it('should show the correct pages on page 1 of 2', () => {
    const currentPage = 1
    const pageCount = 2
    const hrefPrefix = 'example.com?a=b'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { number: 1, href: 'example.com?a=b&page=1', current: true },
        { number: 2, href: 'example.com?a=b&page=2', current: false },
      ],
      next: { href: 'example.com?a=b&page=2' },
      previous: undefined,
    })
  })

  it('should show the correct pages on page 2 of 2', () => {
    const currentPage = 2
    const pageCount = 2
    const hrefPrefix = 'example.com?'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { number: 1, href: 'example.com?page=1', current: false },
        { number: 2, href: 'example.com?page=2', current: true },
      ],
      next: undefined,
      previous: { href: 'example.com?page=1' },
    })
  })

  it('should show the correct pages on page 1 of 3', () => {
    const currentPage = 1
    const pageCount = 3
    const hrefPrefix = 'example.com?a=b&'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { number: 1, href: 'example.com?a=b&page=1', current: true },
        { number: 2, href: 'example.com?a=b&page=2', current: false },
        { number: 3, href: 'example.com?a=b&page=3', current: false },
      ],
      next: { href: 'example.com?a=b&page=2' },
      previous: undefined,
    })
  })

  it('should show the correct pages on page 2 of 3', () => {
    const currentPage = 2
    const pageCount = 3
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { number: 1, href: 'example.com?page=1', current: false },
        { number: 2, href: 'example.com?page=2', current: true },
        { number: 3, href: 'example.com?page=3', current: false },
      ],
      previous: { href: 'example.com?page=1' },
      next: { href: 'example.com?page=3' },
    })
  })

  it('should show the correct pages on page 3 of 3', () => {
    const currentPage = 3
    const pageCount = 3
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { number: 1, href: 'example.com?page=1', current: false },
        { number: 2, href: 'example.com?page=2', current: false },
        { number: 3, href: 'example.com?page=3', current: true },
      ],
      previous: { href: 'example.com?page=2' },
      next: undefined,
    })
  })
})
