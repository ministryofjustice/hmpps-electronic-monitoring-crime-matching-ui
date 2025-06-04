export const createPaginationData = (page: number, totalPages: number, baseUrl: string): PaginationData => {
    const previous = page > 1 ? { href: `${baseUrl}&page=${page - 1}` } : null

    const next = page < totalPages ? { href: `${baseUrl}&page=${page + 1}` } : null

    const items = Array.from({ length: totalPages }, (_, i) => {
      const number = i + 1
      return {
        number,
        current: number === page,
        href: `${baseUrl}&page=${number}`,
      }
    })
    
    return {
        previous: { previous },
        next: { next },
        items
    }
}


export interface PaginationData {
    previous: {}
    next: {}
    items: {}
}