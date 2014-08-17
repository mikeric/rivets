# 0.6

### Changes

- Support for multiple adapters through interfaces.
- Ships with a built-in `.` adapter using ES5 natives (getters and setters).
- Support for nested keypaths (`user.address:zip`).

### Upgrading from 0.5

- All dependencies now stem from the target object, not the view's scope object. Make sure to change all dependency keypaths so that they stem from the object that points to the computed property / function.
- The `prefix` configuration is now an absolute prefix (you need to include "data" in the prefix if you want to use data attributes). Defaults to `rv`. Make sure to change all existing attribute names to `rv-[binder]` or update your `prefix` configuration option.

### Release notes

- The built-in adapter observes array mutations (push, pop, unshift, etc.) but not changes made to indexes on the array directly (`array[3] = 'world'` for example).
- The built-in adapter cannot subscribe to an array's `length` property. Currently you need to use a formatter to access the array's `length` property (`list.items | length`).
