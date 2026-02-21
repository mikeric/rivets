# Installation

You can grab the latest stable release [here](/dist/rivets.min.js) or install using the package manager of your choice. We currently maintain releases on npm, component, jam and bower (recommended).

```bash
bower install rivets
```

Rivets' only hard dependency is [Sightglass](https://github.com/mikeric/sightglass). If you wish to include Sightglass separately, just make sure to include it first.

```html
<script src="bower_components/sightglass/index.js"></script>
<script src="bower_components/rivets/dist/rivets.min.js"></script>
```

Alternatively you can just include the bundled distribution if Rivets, which contains both libraries.

```html
<script src="bower_components/rivets/dist/rivets.bundled.min.js"></script>
```

*Note that Rivets unconditionally occupies a `rivets` global but CommonJS and AMD module loaders are fully supported as well.*

# Usage

### Templates

Templates describe your UI in plain HTML. You can define them directly in the document, use template elements or store and load them however you like. Just make sure you have a convenient way to reference your templates when you want to bind some data to them.

```html
<section id="auction">
  <h2>{ auction.product.name }</h2>
  <p>Current bid: { auction.currentBid | money user:settings.currency }</p>

  <aside rv-if="auction.timeLeft | lt 120">
    Hurry up! There is { auction.timeLeft | duration } left.
  </aside>
</section>
```

The important parts to note here are the attributes prefixed with `rv-` and portions of text wrapped in `{ ... }`. These are binding declarations and they are the sole way that Rivets.js ties data to your templates. The values of these declarations all follow the same minimal and expressive syntax.

```
(keypath | primitive) [formatters...]
```

Keypaths get observed and will recompute the binding when any intermediary key changes. A primitive can be a string, number, boolean, null or undefined.

Formatters can be piped to values using `|` and they follow a similarly minimal yet expressive syntax. Formatter arguments can be keypaths or primitives. Keypath arguments get observed and will recompute the binding when any intermediary key changes.

```
(formatter) [keypath | primitive...]
```

### Binding

Simply call `rivets.bind` on a template element with some data that you would like to bind.


```javascript
rivets.bind($('#auction'), { auction, user })
```

*Every call to `rivets.bind` returns a fully data-bound view that you should hold on to for later. You'll need it in order to unbind it's listeners using `view.unbind()`.*

### Configuring

Use `rivets.configure` to set the following configuration options for your app. Note that all configuration options can be overridden locally to a particular view if needed.

```javascript
rivets.configure({

  // Attribute prefix in templates
  prefix: 'rv',

  // Preload templates with initial data on bind
  preloadData: true,

  // Root sightglass interface for keypaths
  rootInterface: '.',

  // Template delimiters for text bindings
  templateDelimiters: ['{', '}'],

  // Alias for index in rv-each binder
  iterationAlias : function(modelName) {
    return '%' + modelName + '%';
  },

  // Augment the event handler of the on-* binder
  handler: function(target, event, binding) {
    this.call(target, event, binding.view.models)
  },

  // Since rivets 0.9 functions are not automatically executed in expressions. If you need backward compatibilty, set this parameter to true
  executeFunctions: false

})
```

# Binders

Binders are the sets of instructions that tell Rivets.js how to update the DOM when an observed property changes. Rivets.js comes bundled with a handful commonly-used binders for your convenience. See the [binder reference](/docs/reference.md) to learn more about the built-in binders that are available out of the box.

While you can accomplish most UI tasks with the built-in binders, it is highly encouraged to extend Rivets.js with your own binders that are specific to the needs of your application.

### One-way binders

One-way binders simply update the DOM when a model property changes (model-to-view only). Let's say we want a simple binder that updates an element's color when the model property changes. Here we can define a one-way `color` binder as a single function. This function takes the element and the current value of the model property, which we will use to updates the element's color.

```javascript
rivets.binders.color = function(el, value) {
  el.style.color = value
}
```

With the above binder defined, you can now utilize the `rv-color` declaration in your views.

```html
<button rv-color="label.color">Apply</button>
```

### Two-way binders

Two-way binders, like one-way binders, can update the DOM when a model property changes (model-to-view) but can also update the model when the user interacts with the DOM (view-to-model), such as updating a control input, clicking an element or interacting with a third-party widget.

In order to update the model when the user interacts with the DOM, you need to tell Rivets.js how to bind and unbind to that DOM element to set the value on the model. Instead of defining the binder as a single function, two-way binders are defined as an object containing a few extra functions.

```javascript
rivets.binders['content-editable'] = {
  bind: function(el) {
    el.setAttribute("contenteditable", true);
    el.addEventListener("keyup", this.publish);
  },
  
  unbind: function(el) {
    el.removeEventListener("keyup", this.publish);
  },
  
  getValue : function(el) {
    return el.innerText;    
  },
  
  routine: function(el, value) {
    el.innerText = value;
  }
};
```

### API

#### binder.bind

This function will get called for this binding on the initial `view.bind()`. Use it to store some initial state on the binding, or to set up any event listeners on the element.

#### binder.unbind

This function will get called for this binding on `view.unbind()`. Use it to reset any state on the element that would have been changed from the routine getting called, or to unbind any event listeners on the element that you've set up in the `binder.bind` function.

#### binder.routine

The routine function is called when an observed attribute on the model changes and is used to update the DOM. When defining a one-way binder as a single function, it is actually the routine function that you're defining.

#### binder.getValue
The getValue function is called when the binder wants to set the value on the model. This function takes the HTML element as only parameter

#### binder.publishes

Set this to true if you want view.publish() to call publish on these bindings.

#### binder.block

Blocks the current node and child nodes from being parsed (used for iteration binding as well as the if/unless binders).

# Formatters

Formatters are functions that mutate the incoming and/or outgoing value of a binding. You can use them to format dates, numbers, currencies, etc. and because they work in a similar fashion to the Unix pipeline, the output of each feeds directly as input to the next one, so you can stack as many of them together as you like.

### One-way formatters

This is by far the most common and practical way to use formatters &mdash; simple read-only mutations to a value. Taking the dates example from above, we can define a `date` formatter that returns a human-friendly version of a date value.

```javascript
rivets.formatters.date = function(value){
  return moment(value).format('MMM DD, YYYY')
}
```

Formatters are applied by piping them to binding declarations using `|` as a delimiter.

```html
<span rv-text="event.startDate | date"></span>
```

### Two-way formatters

Two-way formatters are useful when you want to store a value in a particular format, such as a unix epoch time or a cent value, but still let the user input the value in a different format.

Instead of defining the formatter as a single function, you define it as an object containing `read` and `publish` functions. When a formatter is defined as a single function, Rivets assumes it to be in the read direction only. When defined as an object, Rivets uses it's `read` and `publish` functions to effectively serialize and de-serialize the value.

Using the cent value example from above, let's say we want to store a monetary value as cents but let the user input it in a dollar amount and automatically round to two decimal places when setting the value on the model. For this we can define a two-way `currency` formatter.

```javascript
rivets.formatters.currency = {
  read: function(value) {
    return (value / 100).toFixed(2)
  },
  publish: function(value) {
    return Math.round(parseFloat(value) * 100)
  }
}
```

You can then bind using this formatter with any one-way or two-way binder.

```html
<input rv-value="item.price | currency">
```

Note that you can also chain bidirectional formatters with any other formatters, and in any order. They read from left to right, and publish from right to left, skipping any read-only formatters when publishing the value back to the model.

### Formatter arguments

Formatters can accept any number of arguments in the form of keypaths or primitives. Keypath arguments get observed and will recompute the binding when any intermediary key changes. A primitive can be a string, number, boolean, null or undefined.

```html
<span>{ alarm.time | time user.timezone 'hh:mm' }</span>
```

The value of each argument in the binding declaration will be evaluated and passed into the formatter function as an additional argument.

```javascript
rivets.formatters.time = function(value, timezone, format) {
  return moment(value).tz(timezone).format(format)
}
```

# Components

Components let you define reusable views that can be used within any of your templates. For some perspective on where components fit into your templates in relation to binders; binders define custom attributes, while components define custom elements.

A component object must define a `template` function, which returns the template for the component (this can be an HTML string or the actual element). It must also define an `initialize` function, which returns the scope object to bind the view with (this will likely be a controller / viewmodel / presenter).

```javascript
rivets.components['todo-item'] = {
  // Return the template for the component.
  template: function() {
    return JST['todos/todo-item']
  },

  // Takes the original element and the data that was passed into the
  // component (either from rivets.init or the attributes on the component
  // element in the template).
  initialize: function(el, data) {
    return new ItemController({
      item: data.item
    })
  }
}
```

To use the component inside of a template, simply use an element with the same tag name as the component's key. All attributes on the element will get evaluated as keypaths before being passed into the component's `initialize` function.

```html
<todo-item item="myItem"></todo-item>
```

These keypaths will also be observed in both directions so that the component will update if the value changes from the outside and it will set the value if the component changes it from the inside.

Additionally, if you want certain attributes to be static instead of an observed keypath, you can list them out on the `static` property for your components.

```javascript
rivets.components['todo-item'] = {
  static: ['list-style'],
  …
}
```

```html
<todo-item item="myItem" list-style="condensed"></todo-item>
```

Components can also be initialized on their own, outside of a template. This is useful when you want to insert a new view into the DOM yourself, such as the entry point to your entire application or the content of a modal. The API is similar to `rivets.bind`, except that instead of passing it an actual template / element, you just pass it the name of the component and the root element you want the component to render in.

```
rivets.init('my-app', $('body'), {user: user})
```

```
rivets.init('todo-item', $('#modal-content'), {item: myItem})
```

# Adapters

Rivets.js is agnostic about the objects that it can subscribe to. This makes it very flexible as it can adapt to work with virtually any library or framework, but it also means that you need to tell Rivets.js *how* to subscribe to those objects. This is where adapters come in to play. This feature is driven by the [Sightglass](https://github.com/mikeric/sightglass) library.

Each adapter is defined to a unique interface (a single character) which is used to separate the keys in a keypath. The interfaces used in a keypath determine which adapter to use for each intermediary key.

```
user.address:city
```

The above keypath will use the `.` adapter to access the `address` key on the `user` object, and the `:` adapter to access the `city` key on the `address` object. If you can imagine for a second that `address` is just a normal property on the user object pointing to a Backbone model, but `city` is actually an attribute on that Backbone model, you can see how this kind of notation is actually very succint and expressive.

### The built-in adapter

Rivets.js ships with a `.` adapter for subscribing to properties on plain JavaScript objects. The adapter is self-implemented using ES5 natives such as `Object.defineProperty`.

If you need to support non-ES5 browsers (< IE 9), you can replace this adapter to use polyfills or with a third-party library that has the browser support you need.

### Creating an adapter

Adapters are defined on `rivets.adapters` with the interface as the property name and the adapter object as the value. An adapter is just an object that responds to `observe`, `unobserve`, `get` and `set`.

The following `:` adapter works for Backbone.js models / Stapes.js modules.

```javascript
rivets.adapters[':'] = {
  observe: function(obj, keypath, callback) {
    obj.on('change:' + keypath, callback)
  },
  unobserve: function(obj, keypath, callback) {
    obj.off('change:' + keypath, callback)
  },
  get: function(obj, keypath) {
    return obj.get(keypath)
  },
  set: function(obj, keypath, value) {
    obj.set(keypath, value)
  }
}
```

# Computed properties

Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from its dependencies with a `<`. The following text binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

```html
<span rv-text="event.duration < start end"></span>
```

Note that the dependency keypaths stem from the target object, not the view's model context. So for the above declaration, the target is the `event` object, with dependencies on `event.start` and `event.end`.

The `<` notation must only be used directly after the function and before any formatter.

```html
<!-- Wrong -->
<span rv-text="event.duration | anyFormatter < start end">Wrong</span>
<!-- OK -->
<span rv-text="event.duration < start end | myFormatter">OK</span>
```

# Call functions

To call a function in an expression, rivets includes a special formatter `call`. This formatter will call the function, any formatter parameter will become an argument sent to the function. The following text binding will call the function `event.duration` with the two arguments `event.start` and `event.end`.

```html
<span rv-text="event.duration | call event.start event.end"></span>
```
`event.duration` will be called again every time `event.start` and `event.end` change

# Iteration

Use the `rv-each-[item]` binder to have Rivets.js automatically loop over items in an array and append bound instances of that element. Within that element you can bind to the iterated item as well as any contexts that are available in the parent view.

```html
<ul>
  <li rv-each-todo="list.todos">
    <input type="checkbox" rv-checked="todo.done">
    <span>{ todo.summary }</span>
  </li>
<ul>
```

To access the index of the current iteration use the syntax `%item%`, Where `item` is the name of the model you provided in `rv-each-[item]`.  You can also access the index of the iteration by using the key `index` but using this will access only the current iterations index. Note that when nesting `rv-each`'s the parent index is still accessible within the scope via the model name.

```html
<ul>
  <li rv-each-user="app.users">
    <span>User Index : { %user% }</span>

    <ul>
        <li rv-each-comment="user.comments">
            <span>Comment Index : { %comment% }</span>

            <span>User Index : { %user% }</span>
        </li>
    </ul>
  </li>
<ul>
```
