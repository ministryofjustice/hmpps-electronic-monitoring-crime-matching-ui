import {
  GovUkPagination,
  GovUkPaginationItem,
  GovUkPaginationNextItem,
  GovUkPaginationPreviousItem,
} from '../types/govUk/pagination'

const createNextItem = (
  currentPage: number,
  pageCount: number,
  hrefPrefix: string,
): GovUkPaginationNextItem | undefined => {
  if (currentPage < pageCount) {
    return {
      href: `${hrefPrefix}page=${currentPage + 1}`,
    }
  }

  return undefined
}

const createPrevItem = (currentPage: number, hrefPrefix: string): GovUkPaginationPreviousItem | undefined => {
  if (currentPage !== 1) {
    return {
      href: `${hrefPrefix}page=${currentPage - 1}`,
    }
  }

  return undefined
}

const createItems = (currentPage: number, pageCount: number, hrefPrefix: string): Array<GovUkPaginationItem> => {
  const min = Math.max(1, currentPage - 2)
  const max = Math.min(currentPage + 2, pageCount)

  return Array.from({ length: max - min + 1 }, (_, i) => i + min).map(item => ({
    number: item,
    href: `${hrefPrefix}page=${item}`,
    current: item === currentPage,
  }))
}

const sanitiseHrefPrefix = (hrefPrefix: string) => {
  if (hrefPrefix.includes('?')) {
    const lastCharacter = hrefPrefix.at(hrefPrefix.length - 1)

    if (lastCharacter !== '?' && lastCharacter !== '&') {
      return `${hrefPrefix}&`
    }

    return hrefPrefix
  }

  return `${hrefPrefix}?`
}

const pagination = (currentPage: number, pageCount: number, hrefPrefix: string): GovUkPagination => {
  const prefix = sanitiseHrefPrefix(hrefPrefix)

  return {
    items: createItems(currentPage, pageCount, prefix),
    next: createNextItem(currentPage, pageCount, prefix),
    previous: createPrevItem(currentPage, prefix),
  }
}

export default pagination
