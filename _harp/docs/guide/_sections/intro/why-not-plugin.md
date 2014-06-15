Extending a library to do things it isn't supposed to do and that are not directly related with its core goal defeats the Single Responsibility Principle and is considered a bad practice besides its broad use.

DOM manipulation libraries should only be concerned with manipulating the DOM. Templating libraries should only be concerned with templating.

> A duck can walk, fly and swim, but he can't do any of these things well.

Another reason for not extending an existing library is that the amount of code reused would be so minimal that it doesn't pay-off the flexibility loss. You can use Rivets.js at it's full potential with "any" other library.
