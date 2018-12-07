type Mappable<T, Ordinal> =
  | ((o: Ordinal) => T)
  | Iterable<T>
  | Map<Ordinal, T>
  | T[]
  | IterableIterator<T>
type Orderable<T> =
  | ((o: number) => T)
  | Iterable<T>
  | IterableIterator<T>
  | IterableIterator<number | T>
type Next<Ordinal> = ((o: Ordinal) => Ordinal)[] | ((o: Ordinal) => Ordinal[])

const identity = x => x
const MaxIterability = 1000
const DefaultRecurrence = (x, c) => identity(x)
const access = (source, argument) =>
  typeof source === 'function' ? source(argument) : source[argument]
const getIteratedNextFunction = <Ordinal>(
  next: Next<Ordinal>,
  tuplicity: number
) => {
  debugger
  return !(next instanceof Array)
    ? x =>
        Array.from(
          new Array(
            tuplicity === Infinity
              ? // && next === DefaultNext
                x
              : tuplicity > 0
              ? tuplicity - 1
              : 0
          )
        ).reduce((acc, _) => [...next(acc.slice(-1)[0]), ...acc], next(x))
    : x =>
        Array.from(new Array(tuplicity > 0 ? tuplicity - 1 : 0))
          .reduce(
            (acc, _) => [
              ...Array.from(new Array(next.length))
                .map(_ => acc.slice(-1).map(fn => _x => fn(fn(_x))))
                .reduce((acc, arr) => [...arr, ...acc]),
              ...acc,
            ],
            next
          )
          .map(fn => fn(x))
}
const getDefaultTuplicity = <Ordinal, T>(
  next: Next<Ordinal>,
  base: Mappable<T, Ordinal>
) =>
  base instanceof Array ? base.length : next instanceof Array ? next.length : 1
const getFirstCases = <T>(iterator: IterableIterator<T>, n = 0) => {
  let count = 0
  let firstCases = []
  while (count < n) {
    firstCases = [...firstCases, iterator.next().value]
    count++
  }
  return firstCases
}
const getGetBaseCase = <T, Ordinal>(
  base: Mappable<T, Ordinal>,
  ordering: IterableIterator<T>
) => {
  if (ordering && base instanceof Array) {
    const firstCases = getFirstCases(ordering, base.length)
    return recursiveCase =>
      base[
        [...new Array(base.length)]
          .map((_, i) => i)
          .filter(i => firstCases[i] === recursiveCase)[0]
      ] //error handling
  }
  return recursiveCase =>
    typeof base === 'function' ? base(recursiveCase) : base[recursiveCase]
}

function* makeRangeIterator(start = 0, end = Infinity, step = 1) {
  let iterationCount = 0
  for (let i = start; i < end; i += step) {
    iterationCount++
    yield i
  }
  return iterationCount
}

function* makeOffsetIterator<T>(orderable: Orderable<T>, offset = 0) {
  let iterationCount = 0
  const iterator = toIterator(orderable)
  let next = iterator.next()
  while (!next.done) {
    iterationCount++
    if (iterationCount >= offset) {
      yield next.value as T
    }
    next = iterator.next()
  }
  return iterationCount
}
function* toIterator<T>(orderable: Orderable<T>) {
  let iterationCount = 0
  if (typeof orderable === 'function') {
    while (true) {
      iterationCount++
      yield orderable(iterationCount) as T
    }
  } else if (getIsIterator(orderable)) {
    for (const o of orderable) {
      iterationCount++
      yield o
    }
  }
  return iterationCount
}

const getIsIterable = obj => Symbol.iterator in Object(obj)
const getIsIterator = obj => getIsIterable(obj) && obj.next
const getExplicitBaseFromOrdering = <T, Ordinal>({
  base,
  ordering = makeRangeIterator(),
  offset = 0,
}: {
  base: Mappable<T, Ordinal>
  ordering: Orderable<T>
  offset: number
}) => {
  if (base instanceof Array) return base
  let i = 0
  let _base = [] as T[]
  if (typeof ordering === 'function') {
  } else {
    for (let internalCase of ordering) {
      if (i > MaxIterability) {
        throw 'base case overflow'
      }
      let nextValue = access(base, internalCase)
      if (i === offset && nextValue === undefined) {
        throw 'no base cases for tail optimization'
      }
      if (i > offset && nextValue === undefined) {
        break
      }
      if (i >= offset) {
        _base = [..._base, nextValue]
      }
      i++
    }
    return _base
  }
}
const getIsSinglePassTailable = <T, Ordinal>(
  base: Mappable<T, Ordinal>,
  ordering: IterableIterator<T>
) => getIsIterable(base) || ordering

const _getBaseCaseResult = (
  recursiveCase,
  base,
  next,
  shouldAccumulate = false
) => {
  let currentCase = recursiveCase
  let nextCases
  let baseCaseResult = access(base, currentCase)
  let numIterations = 0
  let accs
  while (baseCaseResult === undefined && numIterations < MaxIterability) {
    numIterations += 1
    nextCases = next(currentCase)
    currentCase = nextCases.slice(-1)[0]
    baseCaseResult = access(base, currentCase)
    if (shouldAccumulate) {
      accs = [...accs, baseCaseResult]
    }
  }
  if (numIterations === MaxIterability)
    throw 'recurso reached maximum iterations'
  return { baseCaseResult, accs }
}

const getBaseCaseResult = (recursiveCase, base, next) =>
  _getBaseCaseResult(recursiveCase, base, next).baseCaseResult

const getBaseCaseResults = (recursiveCase, base, next) =>
  _getBaseCaseResult(recursiveCase, base, next, true).accs
const recurso = <T, Ordinal>({
  base,
  ordering,
  next, //or backwards iterator or number
  memoize,
  recurrence = DefaultRecurrence,
  tuplicity = getDefaultTuplicity<Ordinal, T>(next, base),
  offset = 0,
  optimizeRuntime = false,
}: // = getIsIterable(base) ? makeOffsetIterator(makeRangeIterator(), offset) : undefined // iterable or function
{
  base: Mappable<T, Ordinal>
  ordering?: Orderable<T>
  next?: Next<Ordinal>
  recurrence?: (recursiveCases: T[], o: Ordinal | number) => T
  tuplicity?: number
  offset?: number
  memoize?:
    | ((o: Ordinal) => string | number)
    | ((o: any) => string | number)[]
    | true
  optimizeRuntime?: boolean
}) => recursiveCase => {
  const _next = getIteratedNextFunction(next, tuplicity)
  debugger
  const isTailRecursive = recurrence === DefaultRecurrence
  if (isTailRecursive) {
    return getBaseCaseResult(recursiveCase, base, _next)
  }
  const innerIterator = makeOffsetIterator<T>(
    ordering || makeRangeIterator(),
    offset
  )
  const shouldBeSinglePassOptimized = getIsSinglePassTailable(
    base,
    innerIterator
  ) // || iterator
  if (shouldBeSinglePassOptimized) {
    const getBaseCase = getGetBaseCase(base, innerIterator)
    const getIsTerminal = currentCase => getBaseCase(currentCase) !== undefined
    if (getIsTerminal(recursiveCase)) {
      return getBaseCase(recursiveCase)
    }
    const nextInnerCase = innerIterator.next().value
    debugger
    return recurso<T, { accs: T[]; outerCase: Ordinal; innerCase?: Ordinal }>({
      base: ({ accs, outerCase }) => {
        if (getIsTerminal(outerCase)) return accs.slice(-1)[0]
      },
      next: ({ accs, outerCase, innerCase }) => {
        const lastAccs = accs.slice(tuplicity === Infinity ? 0 : 1)
        const newAcc = recurrence(accs, innerCase)
        const nextInnerCase = innerIterator.next().value
        return [
          {
            accs: [...(tuplicity === Infinity ? [newAcc] : lastAccs), newAcc],
            outerCase: _next(outerCase).slice(-1)[0],
            innerCase: nextInnerCase as any,
          },
        ]
      },
    })({
      accs: getExplicitBaseFromOrdering({ base, ordering, offset }),
      innerCase: nextInnerCase,
      outerCase: recursiveCase,
    })
  }
  const shouldBeDoublePassOptimized =
    !getIsSinglePassTailable && (!!ordering || getIsIterable(base))
  // if (shouldBeDoublePassOptimized) {
  //   const accs = getBaseCaseResults(recursiveCase, base, _next)
  //   return recursoList<T>(base)
  // }
}

const recursoList = <T>(
  list,
  {
    base = undefined,
    recurrence = DefaultRecurrence,
    tuplicity = base instanceof Array ? base.length : undefined,
    // = getIsIterable(base) ? makeOffsetIterator(makeRangeIterator(), offset) : undefined // iterable or function
  } = {}
) =>
  recurso<T, number>({
    base,
    recurrence,
    tuplicity,
    ordering: i => list[i],
  })

export { recurso, recursoList }
