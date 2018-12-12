# robo

Recursive Optimization through Bare Operation

leveraging of parameter destructuring
imoplicit tail call optimization
recursive abstraction

## First-order recursion

```
const fact = robo(
  { base: [1], next: [n => n - 1] },
  ([nextCase], n) => n * nextCase
)
```

## Higher-order recursion

```
const fib = robo(
  { base: [0, 1], next: [n => n - 2, n => n - 1] },
  ([subcase0, subcase1]) => x + y
)
```

```
const numDerangements = robo(
  {
    base: [1, 0]
  },
  ([subcase0, subcase1], n) => (n - 1) * (x + y)
)
```

```
const buySell = robo(
  {
    next: maxProfitNextCase,
    base: arr => {
      if (arr.length === 2) return arr[1] - arr[0]
      if (arr.length === 1) return 0
    }
  },
  ([leftMaxProft, rightMaxProfit], arr, [left, right]) => {
    return Math.max(
      leftMaxProft,
      rightMaxProfit,
      Math.max(...right) - Math.min(...left)
    )
  }
)
```

## List-based recursion

```
const efficientSubsets = roboList(
  { base: [[[]]], next: [i => i - 1] },
  ([subsets], el) => [...subsets, ...subsets.map(subset => [el, ...subset])]
)
```
