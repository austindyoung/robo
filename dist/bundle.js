!(function(o) {
  var e = {}
  function t(i) {
    if (e[i]) return e[i].exports
    var n = (e[i] = { i: i, l: !1, exports: {} })
    return o[i].call(n.exports, n, n.exports, t), (n.l = !0), n.exports
  }
  ;(t.m = o),
    (t.c = e),
    (t.d = function(o, e, i) {
      t.o(o, e) || Object.defineProperty(o, e, { enumerable: !0, get: i })
    }),
    (t.r = function(o) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(o, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(o, '__esModule', { value: !0 })
    }),
    (t.t = function(o, e) {
      if ((1 & e && (o = t(o)), 8 & e)) return o
      if (4 & e && 'object' == typeof o && o && o.__esModule) return o
      var i = Object.create(null)
      if (
        (t.r(i),
        Object.defineProperty(i, 'default', { enumerable: !0, value: o }),
        2 & e && 'string' != typeof o)
      )
        for (var n in o)
          t.d(
            i,
            n,
            function(e) {
              return o[e]
            }.bind(null, n)
          )
      return i
    }),
    (t.n = function(o) {
      var e =
        o && o.__esModule
          ? function() {
              return o.default
            }
          : function() {
              return o
            }
      return t.d(e, 'a', e), e
    }),
    (t.o = function(o, e) {
      return Object.prototype.hasOwnProperty.call(o, e)
    }),
    (t.p = ''),
    t((t.s = 1))
})([
  function(o, e, t) {
    var i, n
    ;(i = [t, e, t(0)]),
      void 0 ===
        (n = function(o, e, t) {
          'use strict'
          let i
          Object.defineProperty(e, '__esModule', { value: !0 })
          const n = o => e =>
              e < o
                ? e
                : [...new Array(o)]
                    .map((t, i) => n(o)(e - i - 1))
                    .reduce((o, e) => o + e, 0),
            r = n(3),
            c = n(4),
            d = t.recurso({ base: [0, 1], recurrence: ([o, e]) => o + e }),
            s = t.recurso({ base: [1], recurrence: ([o], e) => e * o }),
            u = o => o.reduce((o, e) => o + e, 0),
            v = o =>
              t.recurso({
                base: [...new Array(o)].map((o, e) => e),
                recurrence: u,
              }),
            a = v(3),
            B = v(4),
            f = t.recurso({
              base: [0, 1],
              next: [o => o - 2, o => o - 1],
              recurrence: ([o, e]) => o + e,
            }),
            b = t.recurso({
              base: [0, 1],
              next: [o => o - 1],
              recurrence: ([o, e]) => o + e,
            }),
            l = t.recurso({
              base: [1],
              next: [o => o - 1],
              recurrence: ([o], e) => e * o,
            }),
            p = t.recurso({
              base: [1, 0],
              recurrence: ([o, e], t) => (t - 1) * (o + e),
            })
          t.recurso({
            base: [1, 0],
            next: [o => o - 1, o => o - 2],
            recurrence: ([o, e], t) => (t - 1) * (o + e),
          })
          ;(e.test = () => {
            ;(void 0)('single pass optimization works for', function() {
              ;(void 0)('fibonacci', function() {
                i('base cases', function() {
                  ;(void 0)(f(0)).toBe(0), (void 0)(f(1)).toBe(1)
                }),
                  i('rest', function() {
                    ;(void 0)(f(2)).toBe(1),
                      (void 0)(f(3)).toBe(2),
                      (void 0)(f(4)).toBe(3),
                      (void 0)(f(5)).toBe(5),
                      (void 0)(f(6)).toBe(8)
                  })
              }),
                (void 0)('implicit fibonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(b(0)).toBe(0), (void 0)(b(1)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(b(2)).toBe(1),
                        (void 0)(b(3)).toBe(2),
                        (void 0)(b(4)).toBe(3),
                        (void 0)(b(5)).toBe(5),
                        (void 0)(b(6)).toBe(8)
                    })
                }),
                (void 0)('super implicit fibonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(d(0)).toBe(0), (void 0)(d(1)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(d(2)).toBe(1),
                        (void 0)(d(3)).toBe(2),
                        (void 0)(d(4)).toBe(3),
                        (void 0)(d(5)).toBe(5),
                        (void 0)(d(6)).toBe(8)
                    })
                }),
                (void 0)('test tribonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(a(0)).toBe(r(0)), (void 0)(a(1)).toBe(r(1))
                  }),
                    i('rest', function() {
                      ;(void 0)(a(2)).toBe(r(2)),
                        (void 0)(a(3)).toBe(r(3)),
                        (void 0)(a(4)).toBe(r(4)),
                        (void 0)(a(5)).toBe(r(5)),
                        (void 0)(a(6)).toBe(r(6))
                    })
                }),
                (void 0)('test quadbonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(B(0)).toBe(c(0)), (void 0)(B(1)).toBe(c(1))
                  }),
                    i('rest', function() {
                      ;(void 0)(B(2)).toBe(c(2)),
                        (void 0)(B(3)).toBe(c(3)),
                        (void 0)(B(4)).toBe(c(4)),
                        (void 0)(B(5)).toBe(c(5)),
                        (void 0)(B(6)).toBe(c(6))
                    })
                }),
                (void 0)('factorial', function() {
                  i('base cases', function() {
                    ;(void 0)(s(0)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(s(1)).toBe(1),
                        (void 0)(s(2)).toBe(2),
                        (void 0)(s(3)).toBe(6),
                        (void 0)(s(4)).toBe(24)
                    })
                }),
                (void 0)('explicit factorial', function() {
                  i('base cases', function() {
                    ;(void 0)(l(0)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(l(1)).toBe(1),
                        (void 0)(l(2)).toBe(2),
                        (void 0)(l(3)).toBe(6),
                        (void 0)(l(4)).toBe(24)
                    })
                }),
                (void 0)('derangements', function() {
                  i('base cases', function() {
                    ;(void 0)(p(0)).toBe(1), (void 0)(p(1)).toBe(0)
                  }),
                    i('rest', function() {
                      ;(void 0)(p(2)).toBe(1),
                        (void 0)(p(3)).toBe(2),
                        (void 0)(p(4)).toBe(9),
                        (void 0)(p(5)).toBe(44)
                    })
                })
            })
          }),
            e.test()
        }.apply(e, i)) || (o.exports = n)
  },
  function(o, e, t) {
    var i, n
    ;(i = [t, e, t(0)]),
      void 0 ===
        (n = function(o, e, t) {
          debugger
          ;('use strict')
          let i
          Object.defineProperty(e, '__esModule', { value: !0 })
          const n = o => e =>
              e < o
                ? e
                : [...new Array(o)]
                    .map((t, i) => n(o)(e - i - 1))
                    .reduce((o, e) => o + e, 0),
            r = n(3),
            c = n(4),
            d = t.recurso({ base: [0, 1], recurrence: ([o, e]) => o + e }),
            s = t.recurso({ base: [1], recurrence: ([o], e) => e * o }),
            u = o => o.reduce((o, e) => o + e, 0),
            v = o =>
              t.recurso({
                base: [...new Array(o)].map((o, e) => e),
                recurrence: u,
              }),
            a = v(3),
            B = v(4),
            f = t.recurso({
              base: [0, 1],
              next: [o => o - 2, o => o - 1],
              recurrence: ([o, e]) => o + e,
            }),
            b = t.recurso({
              base: [0, 1],
              next: [o => o - 1],
              recurrence: ([o, e]) => o + e,
            }),
            l = t.recurso({
              base: [1],
              next: [o => o - 1],
              recurrence: ([o], e) => e * o,
            }),
            p = t.recurso({
              base: [1, 0],
              recurrence: ([o, e], t) => (t - 1) * (o + e),
            })
          t.recurso({
            base: [1, 0],
            next: [o => o - 1, o => o - 2],
            recurrence: ([o, e], t) => (t - 1) * (o + e),
          })
          ;(e.test = () => {
            ;(void 0)('single pass optimization works for', function() {
              ;(void 0)('fibonacci', function() {
                i('base cases', function() {
                  ;(void 0)(f(0)).toBe(0), (void 0)(f(1)).toBe(1)
                }),
                  i('rest', function() {
                    ;(void 0)(f(2)).toBe(1),
                      (void 0)(f(3)).toBe(2),
                      (void 0)(f(4)).toBe(3),
                      (void 0)(f(5)).toBe(5),
                      (void 0)(f(6)).toBe(8)
                  })
              }),
                (void 0)('implicit fibonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(b(0)).toBe(0), (void 0)(b(1)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(b(2)).toBe(1),
                        (void 0)(b(3)).toBe(2),
                        (void 0)(b(4)).toBe(3),
                        (void 0)(b(5)).toBe(5),
                        (void 0)(b(6)).toBe(8)
                    })
                }),
                (void 0)('super implicit fibonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(d(0)).toBe(0), (void 0)(d(1)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(d(2)).toBe(1),
                        (void 0)(d(3)).toBe(2),
                        (void 0)(d(4)).toBe(3),
                        (void 0)(d(5)).toBe(5),
                        (void 0)(d(6)).toBe(8)
                    })
                }),
                (void 0)('test tribonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(a(0)).toBe(r(0)), (void 0)(a(1)).toBe(r(1))
                  }),
                    i('rest', function() {
                      ;(void 0)(a(2)).toBe(r(2)),
                        (void 0)(a(3)).toBe(r(3)),
                        (void 0)(a(4)).toBe(r(4)),
                        (void 0)(a(5)).toBe(r(5)),
                        (void 0)(a(6)).toBe(r(6))
                    })
                }),
                (void 0)('test quadbonacci', function() {
                  i('base cases', function() {
                    ;(void 0)(B(0)).toBe(c(0)), (void 0)(B(1)).toBe(c(1))
                  }),
                    i('rest', function() {
                      ;(void 0)(B(2)).toBe(c(2)),
                        (void 0)(B(3)).toBe(c(3)),
                        (void 0)(B(4)).toBe(c(4)),
                        (void 0)(B(5)).toBe(c(5)),
                        (void 0)(B(6)).toBe(c(6))
                    })
                }),
                (void 0)('factorial', function() {
                  i('base cases', function() {
                    ;(void 0)(s(0)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(s(1)).toBe(1),
                        (void 0)(s(2)).toBe(2),
                        (void 0)(s(3)).toBe(6),
                        (void 0)(s(4)).toBe(24)
                    })
                }),
                (void 0)('explicit factorial', function() {
                  i('base cases', function() {
                    ;(void 0)(l(0)).toBe(1)
                  }),
                    i('rest', function() {
                      ;(void 0)(l(1)).toBe(1),
                        (void 0)(l(2)).toBe(2),
                        (void 0)(l(3)).toBe(6),
                        (void 0)(l(4)).toBe(24)
                    })
                }),
                (void 0)('derangements', function() {
                  i('base cases', function() {
                    ;(void 0)(p(0)).toBe(1), (void 0)(p(1)).toBe(0)
                  }),
                    i('rest', function() {
                      ;(void 0)(p(2)).toBe(1),
                        (void 0)(p(3)).toBe(2),
                        (void 0)(p(4)).toBe(9),
                        (void 0)(p(5)).toBe(44)
                    })
                })
            })
          }),
            e.test()
        }.apply(e, i)) || (o.exports = n)
  },
])
