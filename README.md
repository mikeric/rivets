# Rivets.js

Rivets.js is a lightweight data binding and templating system that facilitates building data-driven views. It is agnostic about every aspect of a front-end MV(C|VM|P) stack, making it easy to introduce it into your current workflow or to use it as part of your own custom front-end stack comprised of other libraries.

## Usage

```html
<section id="auction">
  <h3>{ auction.product.name }</h3>
  <p>Current bid: { auction.currentBid | money }</p>

  <aside rv-if="auction.timeLeft | lt 120">
    Hurry up! There is { auction.timeLeft | time } left.
  </aside>
</section>
```

```javascript
rivets.bind($('#auction'), {auction: auction})
```

## Getting Started and Documentation

Documentation is available on the [homepage](http://rivetsjs.com). Learn by reading the [Guide](http://rivetsjs.com/docs/guide/) and refer to the [Binder Reference](http://rivetsjs.com/docs/reference/) to see what binders are available to you out-of-the-box.

## Building and Testing

First install any development dependencies.

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

#### Bug Reporting

1. Ensure the bug can be reproduced on the latest master.
2. Open an issue on GitHub and include an isolated [JSFiddle](http://jsfiddle.net/) demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull Requests

1. Fork the repository and create a topic branch.
3. Make sure not to commit any changes under `dist/` as they will surely cause conflicts for others later. Files under `dist/` are only committed when a new build is released.
4. Include tests that cover any changes or additions that you've made.
5. Push your topic branch to your fork and submit a pull request. Include details about the changes as well as a reference to related issue(s).
