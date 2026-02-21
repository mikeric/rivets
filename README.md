# Rivets.js

Rivets.js is a lightweight data binding and templating system that facilitates building data-driven views. Simply mutate properties at any depth on a bound object, and the UI updates automatically. This is achieved by subscribing to the individual junctions on [keypaths](https://github.com/mikeric/sightglass) directly. As mutations occur, the relevant binder functions are called to surgically update the specific DOM element.

It is entirely agnostic about the types of objects or other libraries you wish to use it with. Just define custom adapters for them as needed, or maybe someone [already has](https://github.com/mikeric/rivets/wiki/Adapters).

## DX

```html
<section id="auction">
  <h2>{ auction.product.name }</h2>
  <p>Current bid: { auction.currentBid | money user:settings.currency }</p>

  <aside rv-if="auction.timeLeft | lt 120">
    Hurry up! There is { auction.timeLeft | duration } left.
  </aside>
</section>
```

```javascript
rivets.bind($('#auction'), { auction, user })
```

## Documentation

Get started by reading the [guide](/docs/guide.md) and refer to the [reference](/docs/reference.md) for all included binders.

Additionally, you can find some [community created binders](https://github.com/mikeric/rivets/wiki/Custom-Binders) as well as some [example formatters](https://github.com/mikeric/rivets/wiki/Example-formatters) and [adapters](https://github.com/mikeric/rivets/wiki/Adapters) in the wiki.

## Build

First, make sure to install any development dependencies.

```
$ npm install
```

#### Building

Rivets.js uses [gulp](http://gulpjs.com/) as its build tool. Run the following task to compile + minify the source into `dist/`.

```
$ gulp build
```

#### Testing

Rivets.js uses [mocha](http://visionmedia.github.io/mocha/) as its testing framework, alongside [should](https://github.com/visionmedia/should.js/) for expectations and [sinon](http://sinonjs.org/) for spies, stubs and mocks. Run the following to run the full test suite.

```
$ npm test
```

## Contributing

#### Bug reporting

1. Ensure the bug can be reproduced on the latest master.
2. Open an issue on GitHub and include an isolated [JSFiddle](http://jsfiddle.net/) demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull requests

1. Fork the repository and create a topic branch.
3. Make sure not to commit any changes under `dist/` as they will surely cause conflicts for others later. Files under `dist/` are only committed when a new build is released.
4. Include tests that cover any changes or additions that you've made.
5. Push your topic branch to your fork and submit a pull request. Include details about the changes as well as a reference to related issue(s).
