# 0.8

#### Changes

- More refined and useful components API. Some documentation is available [here](http://rivetsjs.com/docs/guide/#components).

# 0.7

### Changes

- Support for data-bound keypaths are formatter arguments.

    ```
    { item.price | lte user.balance }
    ```

- Support for primitives in binding declarations. This includes strings, numbers, booleans, null and undefined.

    ```
    { item.updated | date 'MMM DD, YYY' }
    ```

- Primitives are also supported as the binding target.

    ```
    { 'i18n.errors.' | append error | translate }
    ```

- Support for multiple binder arguments (wildcard matches). See [#383](https://github.com/mikeric/rivets/pull/383).

- The `Observer` class has been abstracted out into a new lib as a dependency. See [Sightglass](https://github.com/mikeric/sightglass).

- The built-in `value` binder now listens on the `input` event instead of `change`, so updates will propogate immediately instead of on blur.

- There is no more `rivets.config` object. All of the previous configuration options are defined on the module directly.

- If a template includes `<script>` elements, they will now be ignored when the template is parsed.

### Upgrading from 0.6

- Make sure you include the sightglass lib in your project. Just include `sightglass.js` before `rivets.js`. Alternatively you can just include `rivets.bundled.min.js` once (contains both libraries).

- If you have defined any custom adapters, they will need to be updated from the old property names to the new property names.

    - `adapter.subscribe` is now `adapter.observe`.
    - `adapter.unsubscribe` is now `adapter.unobserve`.
    - `adapter.read` is now `adapter.get`.
    - `adapter.publish` is now `adapter.set`.

- Change all of your existing formatter arguments to be wrapped in quotes. This is because arguments are evaluated as keypaths by default (unless they are wrapped in quotes).

    - For example, if you were previously doing the following:

        ```html
        <p>{ item.enabled | switch green red }</p>
        ```

        You will need to change it to:

        ```html
        <p>{ item.enabled | switch 'green' 'red' }</p>
        ```

    - Note that if your keypath argument was a number, `true`, `false`, `null` or `undefined`, then you can leave them without quotes, but they will be passed to the formatter as the actual primitive value instead of a string.

- If you ever set properties directly on the `rivets.config` object, you will need to change those to the `rivets` object itself.

    - For example, if you were previously doing the following:

        ```javascript
        rivets.config.templateDelimiters = ['{{', '}}']
        ```

        You will need to change it to:

        ```javascript
        rivets.templateDelimiters = ['{{', '}}']
        ```

    - Note that if you were only using `rivets.configure({})` then no changes are needed (`rivets.configure` functions the same as before).

# 0.6

### Changes

- Support for multiple adapters through interfaces.
- Ships with a built-in `.` adapter using ES5 natives (getters and setters).
- Support for nested keypaths (`user.address:zip`).

### Upgrading from 0.5

- All dependencies now stem from the target object, not the view's scope object. Make sure to change all dependency keypaths so that they stem from the object that points to the computed property / function.
- The `prefix` configuration is now an absolute prefix (you need to include "data" in the prefix if you want to use data attributes). Defaults to `rv`. Make sure to change all existing attribute names to `rv-[binder]` or update your `prefix` configuration option.

### Caveats

- The built-in adapter observes array mutations (push, pop, unshift, etc.) but not changes made to indexes on the array directly (`array[3] = 'world'` for example).
- The built-in adapter cannot subscribe to an array's `length` property. Currently you need to use a formatter to access the array's `length` property (`list.items | length`).
