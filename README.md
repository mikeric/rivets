# Rivets.js

Rivets.js is a declarative data binding facility that plays well with existing frameworks such as [Backbone.js](http://backbonejs.org), [Spine.js](http://spinejs.com) and [Stapes.js](http://hay.github.com/stapes/). It aims to be lightweight (2.3KB minified and gzipped), extensible, and configurable to work with any event-driven model.

---

Rivets.js keeps your UI and model data in sync for you, so you can spend less time manually tying into the DOM and more time on your actual data and application logic.

Out-of-the-box it’s got:

- **One-way** and **two-way** binding to/from DOM elements.
- **Computed properties** with dependent attributes.
- **Formatters** to allow mutatating values through piping.
- **A powerful custom bindings API** for building your own binding routines.
- **Easy debugging** and manual bidirectional syncing of bindings.

## Getting Started and Documentation

All documentation for Rivets.js is available on the [homepage](http://rivetsjs.com). See [#configure](http://rivetsjs.com#configure) to learn how to properly configure Rivets.js for your app.

## Building and Testing

Make sure to run npm install so that you have all the development dependencies. To have the test suite run as part of the build process, you'll also need to have PhantomJS installed.

#### Building

Rivets.js uses [grunt](http://gruntjs.com/) as the build tool. Run `grunt build` from within the project root to compile + minify the source into */lib*, or just run `grunt` to have it watch the source file for changes — it will compile + minify into */lib* and run the test suite whenever the source file is saved.

#### Testing

Rivets.js uses [Jasmine](http://pivotal.github.com/jasmine/) as the testing framework. You can run the test suite with `grunt spec` or by opening */spec/index.html*.

## Contributing

#### Bug Reporting

1. Ensure the bug can be reproduced on the latest master release.
2. Open an issue on GitHub and include an isolated JSFiddle demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull Requests

1. Fork the repository and create a topic branch.
2. Be sure to associate commits to their corresponding issue using `[#1]` or `[Closes #1]` if the commit resolves the issue.
3. Make sure not to commit any changes under `lib/` as they will surely cause merge conflicts with other's changes. Files under `lib/` are only committed when a new build is released.
4. Include tests for your changes and make them pass.
5. Push to your fork and submit a pull-request with an explanation and reference to the issue number(s).
