Rivets.js ships with a `.` adapter for subscribing to properties on plain JavaScript objects. The adapter is self-implemented using ES5 natives such as `Object.defineProperty`. In the future, this adapter will be implemented purely using `Object.observe` as soon as browser support permits.

If you need to support non-ES5 browsers (< IE 9), you can replace this adapter to use polyfills or with a third-party library that has the browser support you need. If you're only targetting Chrome Canary, feel free to replace it with an `Object.observe` adapter now and enter data binding bliss.
