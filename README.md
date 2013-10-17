# Rivets.js

Rivets.js is a DOM-based templating system that sits ontop of a configurable component architecure. It let’s you build model-driven views (MDV) using declarative two-way data binding. If used properly it can reduce code complexity in your app by elimating the need to manually update the DOM, letting you focus more on your application’s data and domain logic.

## Getting Started and Documentation

All documentation for Rivets.js is available on the [homepage](http://rivetsjs.com). See the [Getting started](http://rivetsjs.com#getting-started) section to learn how to create views and properly configure Rivets.js for your app.

## Building and Testing

Make sure to run npm install so that you have all the development dependencies. To have the test suite run as part of the build process, you'll also need to have PhantomJS installed.

#### Building

Rivets.js uses [grunt](http://gruntjs.com/) as the build tool. Run `grunt build` from within the project root to compile + minify the source into `dist/`, or just run `grunt` to have it watch the source file for changes. It will compile + minify into `dist/` and run the test suite whenever the source file is saved.

#### Testing

Rivets.js uses [Jasmine](http://pivotal.github.com/jasmine/) as the testing framework. You can run the test suite with `grunt spec`.

## Contributing

#### Bug Reporting

1. Ensure the bug can be reproduced on the latest master.
2. Open an issue on GitHub and include an isolated [JSFiddle](http://jsfiddle.net/) demonstration of the bug. The more information you provide, the easier it will be to validate and fix.

#### Pull Requests

1. Fork the repository and create a topic branch.
2. Be sure to associate commits to their corresponding issue using `[#1]` or `[Closes #1]` if the commit resolves the issue.
3. Make sure not to commit any changes under `dist/` as they will surely cause merge conflicts later. Files under `dist/` are only committed when a new build is released.
4. Include tests for your changes and make them pass.
5. Push to your fork and submit a pull-request with an explanation and reference to the issue number(s).
