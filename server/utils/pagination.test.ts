import pagination from './pagination'

describe('pagination', () => {
  it('should show the correct pages on page 1 of 2', () => {
    const currentPage = 1
    const pageCount = 2
    const hrefPrefix = 'example.com?a=b'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?a=b&page=1', current: true },
        { text: '2', href: 'example.com?a=b&page=2' },
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
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2', current: true },
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
        { text: '1', href: 'example.com?a=b&page=1', current: true },
        { text: '2', href: 'example.com?a=b&page=2' },
        { text: '3', href: 'example.com?a=b&page=3' },
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
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2', current: true },
        { text: '3', href: 'example.com?page=3' },
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
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2' },
        { text: '3', href: 'example.com?page=3', current: true },
      ],
      previous: { href: 'example.com?page=2' },
      next: undefined,
    })
  })

  it('should show the correct pages on page 1 of 7', () => {
    const currentPage = 1
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1', current: true },
        { text: '2', href: 'example.com?page=2' },
        { ellipsis: true },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: undefined,
      next: { href: 'example.com?page=2' },
    })
  })

  it('should show the correct pages on page 2 of 7', () => {
    const currentPage = 2
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2', current: true },
        { text: '3', href: 'example.com?page=3' },
        { ellipsis: true },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: { href: 'example.com?page=1' },
      next: { href: 'example.com?page=3' },
    })
  })

  it('should show the correct pages on page 3 of 7', () => {
    const currentPage = 3
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2' },
        { text: '3', href: 'example.com?page=3', current: true },
        { text: '4', href: 'example.com?page=4' },
        { ellipsis: true },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: { href: 'example.com?page=2' },
      next: { href: 'example.com?page=4' },
    })
  })

  it('should show the correct pages on page 4 of 7', () => {
    const currentPage = 4
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { text: '2', href: 'example.com?page=2' },
        { text: '3', href: 'example.com?page=3' },
        { text: '4', href: 'example.com?page=4', current: true },
        { text: '5', href: 'example.com?page=5' },
        { text: '6', href: 'example.com?page=6' },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: { href: 'example.com?page=3' },
      next: { href: 'example.com?page=5' },
    })
  })

  it('should show the correct pages on page 5 of 7', () => {
    const currentPage = 5
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { ellipsis: true },
        { text: '4', href: 'example.com?page=4' },
        { text: '5', href: 'example.com?page=5', current: true },
        { text: '6', href: 'example.com?page=6' },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: { href: 'example.com?page=4' },
      next: { href: 'example.com?page=6' },
    })
  })

  it('should show the correct pages on page 6 of 7', () => {
    const currentPage = 6
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { ellipsis: true },
        { text: '5', href: 'example.com?page=5' },
        { text: '6', href: 'example.com?page=6', current: true },
        { text: '7', href: 'example.com?page=7' },
      ],
      previous: { href: 'example.com?page=5' },
      next: { href: 'example.com?page=7' },
    })
  })

  it('should show the correct pages on page 7 of 7', () => {
    const currentPage = 7
    const pageCount = 7
    const hrefPrefix = 'example.com'

    expect(pagination(currentPage, pageCount, hrefPrefix)).toEqual({
      items: [
        { text: '1', href: 'example.com?page=1' },
        { ellipsis: true },
        { text: '6', href: 'example.com?page=6' },
        { text: '7', href: 'example.com?page=7', current: true },
      ],
      previous: { href: 'example.com?page=6' },
      next: undefined,
    })
  })
})
