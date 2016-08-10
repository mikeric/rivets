Rivets.js ships with a `.` adapter for subscribing to properties on plain JavaScript objects. The adapter is self-implemented using ES5 natives such as `Object.defineProperty`.

If you need to support non-ES5 browsers (< IE 9), you can replace this adapter to use polyfills or with a third-party library that has the browser support you need.
