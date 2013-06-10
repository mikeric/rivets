---
title: Introduction
anchor: introduction
---

Rivets.js is a DOM-based templating system that sits ontop of a configurable component architecure. It let's you build model-driven views (MDV) using declarative two-way data binding. If used properly it can reduce code complexity in your app by elimating the need to manually update the DOM, letting you focus more on your application's data and domain logic.

It's completely agnostic about the model / controller layer and works well with existing libraries that employ an event-driven model such as [Backbone.js](http://backbonejs.org) and [Stapes.js](http://hay.github.com/stapes/). It also works equally well with POJSOs using [Watch.js](https://github.com/melanke/Watch.JS) or an [Object.observe() shim](https://github.com/KapIT/observe-shim).

Some of the features you get out-of-the-box with Rivets.js.

<ul class="check-list">
  <li><strong>Bi-directional data binding</strong> to and from DOM nodes.</li>
  <li><strong>Computed properties</strong> through dependency mapping.</li>
  <li><strong>Formatters</strong> to allow mutating values through piping.</li>
  <li><strong>Iteration binding</strong> for binding items in an array.</li>
  <li><strong>Custom event handlers</strong> to fit your ideal workflow.</li>
  <li><strong>Uniform APIs</strong> for easily extending any of the core concepts.</li>
</ul>

### DOM-Based Templating

Instead of parsing and compiling template strings into HTML, Rivets.js wires up your models directly to existing parts of DOM that contain binding declarations and control flow instructions directly on the DOM nodes. You just pass in your models when binding to the parent DOM node and Rivets.js takes care of the rest.

This way you can think of your HTML as "blueprints" that define a particular piece of UI --- they can be for entire sections of your app or smaller, more reusable views. You can store them in document fragments outside the render tree, clone them and reuse them however you like.

### Why Isn't It A Plugin For One Of The Famous JS Libraries?

Extending a library to do things it isn't supposed to do and that are not directly related with its core goal defeats the Single Responsibility Principle and is considered a bad practice besides its broad use.

DOM manipulation libraries should only be concerned with manipulating the DOM. Templating libraries should only be concerned with templating.

> A duck can walk, fly and swim, but he can't do any of these things well.

Another reason for not extending an existing library is that the amount of code reused would be so minimal that it doesn't pay-off the flexibility loss. You can use Rivets.js at it's full potential with "any" other library.
