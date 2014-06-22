# Rivets.js

Rivets.js is a DOM-based templating system that sits ontop of a configurable component architecure. It let’s you build model-driven views (MDV) using declarative two-way data binding. If used properly it can reduce code complexity in your app by elimating the need to manually update the DOM, letting you focus more on your application’s data and domain logic.

## Getting Started and Documentation

All documentation for Rivets.js is available on the [homepage](http://rivetsjs.com). See the [Getting started](http://rivetsjs.com/docs/guide/#getting-started) section to learn how to create views and properly configure Rivets.js for your app.

## Building and Testing

First, make sure to install any development dependencies.

```
npm install
```

#### Building

Rivets.js uses [gulp](http://gulpjs.com/) as it's build tool. Run the following task to compile + minify the source into `dist/`.

```
gulp build
```

#### Testing

Rivets.js uses [mocha](http://visionmedia.github.io/mocha/) as it's testing framework, alongside [should](https://github.com/visionmedia/should.js/) for expecations and [sinon](http://sinonjs.org/) for spies, stubs and mocks. Run the following task to run the full test suite.

```
gulp spec
```

## Contributing

#### Bug Reporting

1. Ensure the bug can be reproduced on the latest master.
2. Open an issue on GitHub and include an isolated [JSFiddle](http://jsfiddle.net/) demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull Requests

1. Fork the repository and create a topic branch.
3. Make sure not to commit any changes under `dist/` as they will surely cause merge conflicts later. Files under `dist/` are only committed when a new build is released.
4. Include tests that cover any changes or additions that you've made.
5. Push your topic branch to your fork and submit a pull request. Include details about the changes as well as references to any related issues.
