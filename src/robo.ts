type Mappable<T, Case = number> = ((o: Case) => T) | T[]
type Gener<Case> = () => Iterator<Case>
type Orderable<Case> = Gener<Case>
type Nextable<Case = number> = ((o: Case) => Case)[] | ((o: Case) => Case[])
const identity = x => x
const MaxIterability = 1000
const MaxBase = 100
const DefaultRecurrence = ([x], [c]) => c
const access = <T, Case>(source: Mappable<T, Case>, argument: Case) => {
  if (typeof source === 'function') {
    return source(argument)
  }
  if (source instanceof Array && typeof argument === 'number') {
    return source[argument]
  }
  throw 'cannot index with non-numeric ordinal'
}
const getIteratedNextFunction = <Case>(
  next: Nextable<Case>,
  tuplicity: number
) => {
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
        ).reduce<Case[]>(
          (acc, _) => [...next(acc.slice(-1)[0]), ...acc],
          next(x)
        )
    : x =>
        Array.from(new Array(tuplicity > 0 ? tuplicity - 1 : 0))
          .reduce(
            (acc, _) => [
              ...Array.from(new Array(next.length))
                .map(_ => acc.slice(-1).map(fn => _x => fn(fn(_x))))
                .reduce((acc, arr) => [...arr, ...acc]),
              ...acc
            ],
            next
          )
          .map(fn => fn(x))
}
const getDefaultTuplicity = <Case, T>(
  next: Nextable<Case>,
  base: Mappable<T, Case>
) =>
  base instanceof Array ? base.length : next instanceof Array ? next.length : 1
const getFirstCases = <T>(iterator: IterableIterator<T>, b = 1) => {
  let count = 0
  let firstCases = []
  while (count < b) {
    firstCases = [...firstCases, iterator.next().value]
    count++
  }
  return firstCases.reduce<Map<T, number>>((map, c, i) => {
    map.set(c, i)
    return map
  }, new Map())
}
const getGetBaseCaseAndFirstCases = <T, Case>(
  base: T[],
  ordering: IterableIterator<Case>
) => {
  const firstCases = getFirstCases<Case>(ordering, base.length)
  return {
    firstCases,
    getBaseCase: recursiveCase =>
      base[
        [...new Array(base.length)]
          .map((_, i) => i)
          .filter(i => firstCases[i] === recursiveCase)[0]
      ] //error handling
  }
}

const makeRangeGenerator = (start = 0, end = Infinity, step = 1) =>
  function*() {
    let iterationCount = 0
    for (let i = start; i < end; i += step) {
      iterationCount++
      yield i
    }
    return iterationCount
  }

const makeOffsetGenerator = <T>(generator: Gener<T>, offset = 0) =>
  function*() {
    let iterationCount = 0
    const iterator = generator()
    let next = iterator.next()
    while (!next.done) {
      if (iterationCount >= offset) {
        yield next.value as T
      }
      next = iterator.next()
      iterationCount++
    }
  }

const handleIterationException = (count, max) => {
  if (count > max) {
    throw max === MaxIterability
      ? 'max iterability exceeded'
      : max === MaxBase
      ? 'max base cases exceeded'
      : 'generic iteration threshold exceeded message'
  }
}

const getIsIterable = obj => Symbol.iterator in Object(obj)
const getIsIterator = obj => getIsIterable(obj) && obj.next
const _getBaseCaseResult = <T, Case>(
  recursiveCase: Case,
  base: Mappable<T, Case>,
  next: ((o: Case) => Case[]),
  shouldAccumulate = false
) => {
  let currentCase = recursiveCase
  let nextCases
  let baseCaseResult = access<T, Case>(base, currentCase)
  let numIterations = 0
  let accs
  while (baseCaseResult === undefined && numIterations < MaxIterability) {
    numIterations += 1
    nextCases = next(currentCase)
    currentCase = nextCases.slice(-1)[0]
    baseCaseResult = access<T, Case>(base, currentCase)
    if (shouldAccumulate) {
      accs = [...accs, baseCaseResult]
    }
  }
  if (numIterations === MaxIterability) throw 'robo reached maximum iterations'
  return { baseCaseResult, accs }
}

const getBaseCaseResult = <T, Case>(
  recursiveCase: Case,
  base: Mappable<T, Case>,
  next: (o: Case) => Case[]
) => _getBaseCaseResult<T, Case>(recursiveCase, base, next).baseCaseResult

const getBaseCaseResults = <T, Case>(
  recursiveCase: Case,
  base: Mappable<T, Case>,
  next: (o: Case) => Case[]
) => _getBaseCaseResult<T, Case>(recursiveCase, base, next, true).accs
const DefaultNext = n => {
  if (typeof n === 'number') {
    return [n - 1] as any // `any` since no generic reflection
  }
  if (n === undefined) {
    throw 'generated function requires a parameter'
  }
  throw 'must provide next function for non-numeric ordinals'
}

const HasIntersection = (x, props, has: any[]) =>
  props.every(f => (has.indexOf(f) === -1 && !f(x)) || f(x))
const DoesntHave = (x, doesntHave: any[]) => doesntHave.every(f => !f(x))

// const HasUnion = (x, props, has: any[]) =>
//   props.every(f => (has.indexOf(f) === -1 && !f(x)) || f(x))
type BaseArray<T> = { base: T[] }
const BaseArray = x => x.hasOwnProperty('base') && x.base instanceof Array
type BaseFunction<T, Case> = { base: (o: Case) => T }
const BaseFunction = x =>
  x.hasOwnProperty('base') && typeof x.base === 'function'
type Ordering<Case> = { ordering: Orderable<Case> }
const Ordering = x => x.hasOwnProperty('ordering')
type Next<Case> = { next: Nextable<Case> }
const Next = x => x.hasOwnProperty('next')
type Memoize<Case> = {
  memoize?:
    | ((o: Case) => string | number)
    | ((o: any) => string | number)[]
    | true
}
type Recurrence<T, Case = number> = {
  recurrence: (recursiveCases: T[], ordinals?: Case[]) => T
}
const Recurrence = x => x.hasOwnProperty('recurrence')
const Props = [BaseArray, BaseFunction, Ordering, Next, Recurrence]

type RoboRest = {
  tuplicity?: number
  offset?: number
}

type ImplicitLinear<T> = BaseArray<T> & Recurrence<T> & RoboRest

const ImplicitLinear = <T>(x): x is ImplicitLinear<T> =>
  HasIntersection(x, Props, [BaseArray])
type ExplicitLinear<T, Case> = BaseArray<T> &
  Ordering<Case> &
  Next<Case> &
  Recurrence<T, Case> &
  RoboRest
const ExplicitLinear = <T, Case = number>(x): x is ExplicitLinear<T, Case> =>
  HasIntersection(x, Props, [BaseArray, Ordering, Next])

type NonLinear<T, Case> = BaseFunction<T, Case> &
  Next<Case> &
  Memoize<Case> &
  Recurrence<T, Case> &
  RoboRest

const NonLinear = <T, Case>(x): x is NonLinear<T, Case> =>
  HasIntersection(
    x,
    [BaseArray, BaseFunction, Ordering, Next, Recurrence],
    [BaseFunction, Next]
  )
const getGetBaseCase = <T, Case>(firstCases: Case[], base: T[]) => (
  recursiveCase: Case
) => base[firstCases.indexOf(recursiveCase)]

type TailRecursive<T, Case = number> = (BaseArray<T> | BaseFunction<T, Case>) &
  Next<Case> &
  RoboRest

const TailRecursive = <T, Case>(x): x is TailRecursive<T, Case> =>
  HasIntersection(x, Props, [BaseArray, Next]) ||
  (HasIntersection(x, Props, [BaseFunction, Next]) &&
    DoesntHave(x, [Recurrence]))
class Result<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}
const curry = (...args) => {}
const combine = (...args) => {}
const evaluate = <T, Case>(
  root: Case,
  {
    base,
    next,
    recurrence
  }: {
    base: (o: Case) => T
    next: (o: Case) => Case[]
    recurrence: (results: T[], cases: Case[]) => T
  }
) => {
  if (!root) {
    return
  }
  let node
  const stack = [] as (Case | Result<T>)[]
  let result
  stack.push(node)
  while (stack.length) {
    node = stack.pop()
    if (node instanceof Result) {
      result = combine(result, node, recurrence)
    }
    const children = next(node)
    let isCurrying = false
    let curried
    children.forEach(child => {
      const baseValue = base(child)
      if (baseValue !== undefined && isCurrying) {
        isCurrying = true
        curried = curried
          ? curry(curried, baseValue, recurrence)
          : new Result(baseValue)
        stack.push(curried)
      } else {
        isCurrying = false
        stack.push(child)
      }
    })
  }
  return result
}

const robo = <T, Case = number>(
  params:
    | ImplicitLinear<T>
    | ExplicitLinear<T, Case>
    | NonLinear<T, Case>
    | TailRecursive<T, Case>
): ((recursiveCase: Case) => T | T[][Case & number]) => {
  if (TailRecursive<T, Case>(params)) {
    const { base, next, tuplicity } = params
    const generatedFunction = (recursiveCase: Case) =>
      getBaseCaseResult<T, Case>(
        recursiveCase,
        base,
        getIteratedNextFunction<Case>(next, tuplicity)
      )
    return generatedFunction
  }
  if (NonLinear(params)) {
    return (recursiveCase: Case) => {
      const { base, recurrence } = params
      return evaluate(recursiveCase, {
        base,
        next: params.next as (o: Case) => Case[],
        recurrence
      })
    }
  }
  if (ImplicitLinear<T>(params)) {
    const ordering = makeOffsetGenerator(makeRangeGenerator(), params.offset)
    const next = getIteratedNextFunction(DefaultNext, params.tuplicity)
    return roboLinear<T, number>({
      ...params,
      ordering,
      next
    })
  }
  if (ExplicitLinear<T, Case>(params)) {
    return roboLinear<T, Case>(params)
  }
  throw 'unable to generate function from arguments'
}

const roboLinear = <T, Case = number>({
  base,
  recurrence,
  ordering,
  tuplicity,
  offset,
  next
}: ExplicitLinear<T, Case> &
  (Ordering<Case> | Next<Case>)) => recursiveCase => {
  const innerIterator = makeOffsetGenerator(ordering, offset)()
  const _next = getIteratedNextFunction(next, tuplicity)
  const firstCases = getFirstCases<Case>(innerIterator, base.length)
  const getBaseCase = (recursiveCase: Case) =>
    base[firstCases.get(recursiveCase)]
  const getIsTerminal = (innerCase: Case) =>
    firstCases.get(innerCase) < base.length
  const caseIfBase = getBaseCase(recursiveCase)
  if (caseIfBase !== undefined) {
    return caseIfBase
  }
  interface MetaOrdinal<T, Case> {
    accs: T[]
    outerCase: Case
    innerCases?: Case[]
  }

  return robo<T, MetaOrdinal<T, Case>>({
    base: ({ accs, outerCase }) => {
      if (getIsTerminal(outerCase)) return accs.slice(-1)[0]
    },
    next: ({ accs, outerCase, innerCases }) => {
      const lastCases = innerCases.slice(tuplicity === Infinity ? 0 : 1)
      const nextInnerCases = [...lastCases, innerIterator.next().value]
      const lastAccs = accs.slice(tuplicity === Infinity ? 0 : 1)
      const newAcc = recurrence(accs, nextInnerCases)
      const nextAccs = [...lastAccs, newAcc]
      return [
        {
          accs: nextAccs,
          outerCase: _next(outerCase).slice(-1)[0],
          innerCases: nextInnerCases
        }
      ]
    }
  })({
    accs: base,
    innerCases: [...firstCases.keys()],
    outerCase: recursiveCase
  })
}

// todo: support indefiniteness
// todo: support short-circuiting
const roboList = <T, Element = any>({
  base,
  recurrence,
  // breakout,
  ...rest
}: BaseArray<T> & Recurrence<T, Element> & RoboRest) => (list: Element[]) =>
  robo<T, number>({
    base,
    recurrence: (cs, is) =>
      recurrence(cs, is.map(i => [undefined, ...list][i])), // todo: create special range
    ...rest
  })(list.length)

declare let it
declare let expect
declare let describe

const getKbonacciSource = k => n => {
  if (n < k) return n
  return [...new Array(k)]
    .map((_, i) => getKbonacciSource(k)(n - i - 1))
    .reduce((sumAcc, c) => sumAcc + c, 0)
}

const triFibonacciSource = getKbonacciSource(3)
const quadFibonacciSource = getKbonacciSource(4)

const fibonacci = robo<number>({
  base: [0, 1],
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
})

const factorial = robo<number>({
  base: [1],
  recurrence: ([subcase], [n]) => n * subcase
})

const numDerangements = robo<number, number>({
  base: [1, 0],
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const subsets = roboList<number[][], number>({
  base: [[[]]],
  recurrence: ([subsets], [element]) => [
    ...subsets,
    ...subsets.map(subset => [...subset, element])
  ]
})

const subsetsSource = l =>
  l.reduce(
    (subsets, element) => [
      ...subsets,
      ...subsets.map(subset => [...subset, element])
    ],
    [[]]
  )

const powerOfTwo = robo<number, number>({
  base: [1],
  tuplicity: Infinity,
  recurrence: cases => sum(cases) + 1
})

const fibonacciWithOrdering = robo<number>({
  base: [0, 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
})

const fibonacciIndefinite = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
})

const fibonacciIndefiniteWithOrdering = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
})

const fibonacciIndefiniteSpaceOptimization = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
  // optimizeSpace: true
})

const fibonacciIndefiniteTimeOptimization = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
  // optimizeTime: true
})

const fibonacciIndefiniteWithOrderingSpaceOptimization = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
  // optimizeSpace: true
})

const fibonacciIndefiniteWithOrderingTimeOptimization = robo<number>({
  base: n => {
    if (n <= 0) return n
  },
  next: n => [n - 2, n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
  // optimizeTime: true
})

// const factorialList = robo<number>({
//   base: [1],
//   recurrence: ([subcase], [n]) => n * subcase
// })

const sumList = roboList<number>({
  base: [0],
  recurrence: ([subcase], [n]) => n + subcase
})

const factorialWithOrdering = robo<number>({
  base: [1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase], [n]) => n * subcase
})

const factorialIndefinite = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  recurrence: ([subcase], [n]) => n * subcase
})

const factorialIndefiniteWithOrdering = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase], [n]) => n * subcase
})

const factorialIndefiniteSpaceOptimization = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  recurrence: ([subcase], [n]) => n * subcase
  // optimizeSpace: true
})

const factorialIndefiniteTimeOptimization = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  recurrence: ([subcase], [n]) => n * subcase
  // optimizeTime: true
})

const factorialIndefiniteWithOrderingSpaceOptimization = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase], [n]) => n * subcase
  // optimizeSpace: true
})

const factorialIndefiniteWithOrderingTimeOptimization = robo<number>({
  base: n => {
    if (n === 0) return 1
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase], [n]) => n * subcase
  // optimizeTime: true
})

const factorialOffset = robo<number>({
  base: [1],
  ordering: makeOffsetGenerator(makeRangeGenerator(), 5),
  recurrence: ([subcase], [n]) => n * subcase
})

const sum = (arr: number[]): number => arr.reduce((sumAcc, c) => sumAcc + c, 0)

const getKbonacci = k =>
  robo<number>({
    base: [...new Array(k)].map((_, i) => i),
    recurrence: sum
  })

const getKbonacciWithOrdering = k =>
  robo<number>({
    base: [...new Array(k)].map((_, i) => i),
    ordering: makeRangeGenerator(),
    recurrence: sum
  })

const getKbonacciIndefinite = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    next: n => [n - 1],
    recurrence: sum
  })
const getKbonacciIndefiniteWithOrdering = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    ordering: makeRangeGenerator(),
    next: n => [n - 1],
    recurrence: sum
  })
const getKbonacciIndefiniteSpaceOptimization = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    next: n => [n - 1],
    recurrence: sum
    // optimizeSpace: true
  })
const getKbonacciIndefiniteTimeOptimization = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    next: n => [n - 1],
    recurrence: sum
    // optimizeTime: true
  })

const getKbonacciIndefiniteWithOrderingSpaceOptimization = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    ordering: makeRangeGenerator(),
    next: n => [n - 1],
    recurrence: sum
    // optimizeSpace: true
  })

const getKbonacciIndefiniteWithOrderingTimeOptimization = k =>
  robo<number>({
    base: n => {
      if (n <= k) return n
    },
    ordering: makeRangeGenerator(),
    next: n => [n - 1],
    recurrence: sum
    // optimizeTime: true
  })

const triFibonacci = getKbonacci(3)
const quadFibonacci = getKbonacci(4)
const triFibonacciIndefinite = getKbonacciIndefinite(3)
const quadFibonacciIndefinite = getKbonacciIndefinite(4)
const triFibonacciIndefiniteWithOrdering = getKbonacciIndefiniteWithOrdering(3)
const quadFibonacciIndefiniteWithOrdering = getKbonacciIndefiniteWithOrdering(4)
const triFibonacciIndefiniteWithOrderingSpaceOptimization = getKbonacciIndefiniteWithOrderingSpaceOptimization(
  3
)
const quadFibonacciIndefiniteWithOrderingTimeOptimization = getKbonacciIndefiniteWithOrderingTimeOptimization(
  4
)

const explicitFibonacci = robo<number, number>({
  base: [0, 1],
  next: [n => n - 2, n => n - 1],
  recurrence: ([subcase0, subcase1]) => subcase0 + subcase1
})

const numDerangementsList = roboList<number, number>({
  base: [1, 0],
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsWithOrdering = robo<number, number>({
  base: [1, 0],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsIndefinite = robo<number, number>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsWithOrderingIndefinite = robo<number, number>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsWithOrderingIndefiniteSpaceOptimization = robo<
  number,
  number
>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsWithOrderingIndefiniteTimeOptimization = robo<
  number,
  number
>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsIndefiniteSpaceOptimization = robo<number, number>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

const numDerangementsIndefiniteTimeOptimization = robo<number, number>({
  base: n => {
    if (n === 0) return 1
    if (n === 1) return 0
  },
  next: n => [n - 1],
  ordering: makeRangeGenerator(),
  recurrence: ([subcase0, subcase1], [previous]) =>
    previous * (subcase0 + subcase1)
})

interface Change {
  coins: number[]
  target: number
}
const makeChange = robo<number, Change>({
  base: ({ coins, target }) => {
    if (!coins.length) return 0
    if (target && !coins.length) return 0
    if (!target) return 1
  },
  next: ({ coins, target }) => [
    { coins, target: target - coins[0] },
    { coins: coins.slice(1), target }
  ],
  recurrence: sum,
  memoize: ({ coins, target }) => [coins.length, target]
})

type Choose = {
  n: number
  k: number
}

const binomialCoefficient = robo<number, Choose>({
  base: ({ n, k }) => {
    if (k === 0) return 1
    if (n === k) return 1
  },
  next: ({ n, k }) => [{ n: n - 1, k: k - 1 }, { n, k: k - 1 }],
  recurrence: sum,
  memoize: ({ n, k }) => [n, k]
})

interface BinarySearch<T> {
  subArr: T[]
  displacement: number
}

const binarySearch = <T>(arr: T[], target: T) =>
  robo<number, BinarySearch<T>>({
    base: ({ subArr, displacement }) => {
      if (!subArr.length) return -1
      if (subArr[0] === target) return displacement
    },
    next: ({ subArr, displacement }) => {
      const mid = Math.floor(subArr.length / 2)
      if (target <= subArr[mid])
        return [{ subArr: subArr.slice(0, mid), displacement }]
      return [{ subArr: subArr.slice(mid), displacement: mid + displacement }]
    }
  })

// const mergeSort = <T>(arr: T[]) =>
//   robo<T[], T[]>({
//     base: subArr => {
//       if (!subArr.length) return subArr
//     },
//     next: subArr => {
//       const mid = Math.floor(subArr.length / 2)
//       return [subArr.slice(0, mid), subArr.slice(mid)]
//     },
//     recurrence: ([left, right]) => merge(left, right)
//   })(arr)

// export
const test = () => {
  describe('fibonacci', function() {
    it('base cases', function() {
      expect(fibonacci(0)).toBe(0)
      expect(fibonacci(1)).toBe(1)
    })
    it('rest', function() {
      expect(fibonacci(2)).toBe(1)
      expect(fibonacci(3)).toBe(2)
      expect(fibonacci(4)).toBe(3)
      expect(fibonacci(5)).toBe(5)
      expect(fibonacci(6)).toBe(8)
    })
  })

  describe('test tribonacci', function() {
    it('base cases', function() {
      expect(triFibonacci(0)).toBe(triFibonacciSource(0))
      expect(triFibonacci(1)).toBe(triFibonacciSource(1))
    })
    it('rest', function() {
      expect(triFibonacci(2)).toBe(triFibonacciSource(2))
      expect(triFibonacci(3)).toBe(triFibonacciSource(3))
      expect(triFibonacci(4)).toBe(triFibonacciSource(4))
      expect(triFibonacci(5)).toBe(triFibonacciSource(5))
      expect(triFibonacci(6)).toBe(triFibonacciSource(6))
    })
  })

  describe('test quadbonacci', function() {
    it('base cases', function() {
      expect(quadFibonacci(0)).toBe(quadFibonacciSource(0))
      expect(quadFibonacci(1)).toBe(quadFibonacciSource(1))
    })
    it('rest', function() {
      expect(quadFibonacci(2)).toBe(quadFibonacciSource(2))
      expect(quadFibonacci(3)).toBe(quadFibonacciSource(3))
      expect(quadFibonacci(4)).toBe(quadFibonacciSource(4))
      expect(quadFibonacci(5)).toBe(quadFibonacciSource(5))
      expect(quadFibonacci(6)).toBe(quadFibonacciSource(6))
    })
  })

  describe('factorial', function() {
    it('base cases', function() {
      expect(factorial(0)).toBe(1)
    })
    it('rest', function() {
      expect(factorial(1)).toBe(1)
      expect(factorial(2)).toBe(2)
      expect(factorial(3)).toBe(6)
      expect(factorial(4)).toBe(24)
    })
  })

  describe('derangements', function() {
    it('base cases', function() {
      expect(numDerangements(0)).toBe(1)
      expect(numDerangements(1)).toBe(0)
    })
    it('rest', function() {
      expect(numDerangements(2)).toBe(1)
      expect(numDerangements(3)).toBe(2)
      expect(numDerangements(4)).toBe(9)
      expect(numDerangements(5)).toBe(44)
    })
  })
  describe('List recursion works for', function() {
    describe('subsets', function() {
      it('base cases', function() {
        expect(subsets([])).toEqual([[]])
      })
      it('rest', function() {
        expect(subsets([1])).toEqual(subsetsSource([1]))
        expect(subsets([1, 2])).toEqual(subsetsSource([1, 2]))
        expect(subsets([1, 2, 3])).toEqual(subsetsSource([1, 2, 3]))
        expect(subsets([1, 2, 3, 4])).toEqual(subsetsSource([1, 2, 3, 4]))
        expect(
          subsets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])
        ).toEqual(
          subsetsSource([
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17
          ])
        )
      })
    })
  })
  describe('List recursion works for', function() {
    describe('subsets', function() {
      it('base cases', function() {
        expect(subsets([])).toEqual([[]])
      })
      it('rest', function() {
        expect(subsets([1])).toEqual(subsetsSource([1]))
        expect(subsets([1, 2])).toEqual(subsetsSource([1, 2]))
        expect(subsets([1, 2, 3])).toEqual(subsetsSource([1, 2, 3]))
        expect(subsets([1, 2, 3, 4])).toEqual(subsetsSource([1, 2, 3, 4]))
        expect(
          subsets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])
        ).toEqual(
          subsetsSource([
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17
          ])
        )
      })
      describe('power of two', function() {
        it('base cases', function() {
          expect(powerOfTwo(0)).toBe(1)
        })
        it('rest', function() {
          expect(powerOfTwo(1)).toBe(2)
          expect(powerOfTwo(2)).toBe(4)
          expect(powerOfTwo(3)).toBe(8)
          expect(powerOfTwo(4)).toBe(16)
        })
      })
    })
    describe('single pass optimization with custom ordering works for', function() {})

    describe('double pass optimization works for', function() {})

    describe('double pass optimization with custom ordering works for', function() {})

    describe('double pass time optimization works for', function() {})

    describe('double pass time optimization with custom ordering works for', function() {})

    describe('double pass space optimization works for', function() {})

    describe('double pass space optimization with custom ordering works for', function() {})

    describe('list recursion works for', function() {})

    describe('list recursion with short circuiting works for', function() {})

    describe('divide-and-conqceur works for', function() {})
    describe('divide-and-conqceur implicit single-dimensional memoization works for', function() {})

    describe('divide-and-conqceur explicit multi-dimensional memoization works for', function() {})

    // export { robo, roboList }
  })
}
test()
