Rivets.js is a DOM-based templating system that sits ontop of a configurable component architecure. It let's you build model-driven views (MDV) using declarative two-way data binding. If used properly it can reduce code complexity in your app by elimating the need to manually update the DOM, letting you focus more on your application's data and domain logic.

It's completely agnostic about your model / controller layer and works well with existing libraries that employ an event-driven model such as [Backbone.js](http://backbonejs.org/) and [Stapes.js](http://hay.github.com/stapes/). It also works equally well with POJSOs using [Watch.JS](https://github.com/melanke/Watch.JS) or an [Object.observe shim](https://github.com/KapIT/observe-shim).

Some of the features you get out-of-the-box with Rivets.js.

<ul class="check-list">
  <li><strong>Bi-directional data binding</strong> to and from DOM nodes.</li>
  <li><strong>Computed properties</strong> through dependency mapping.</li>
  <li><strong>Formatters</strong> to allow mutating values through piping.</li>
  <li><strong>Iteration binding</strong> for binding items in an array.</li>
  <li><strong>Custom event handlers</strong> to fit your ideal workflow.</li>
  <li><strong>Uniform APIs</strong> for easily extending any of the core concepts.</li>
</ul>
