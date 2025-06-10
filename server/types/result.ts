type Failure<E = Error> = {
  ok: false
  error: E
}

type Success<T> = T extends void
  ? {
      ok: true
    }
  : {
      ok: true
      data: T
    }

type Result<T, E> = Success<T> | Failure<E>

export default Result
