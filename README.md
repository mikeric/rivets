# Rivets.js

Rivets.js is a declarative data binding facility that plays well with existing frameworks such as [Backbone.js](http://backbonejs.org), [Spine.js](http://spinejs.com) and [Stapes.js](http://hay.github.com/stapes/). It aims to be lightweight (1.9KB minified and gzipped), extensible, and configurable to work with any event-driven model.

---

Describe your UI in plain HTML using data attributes:

    <div id='auction'>
      <h1 data-text='auction.title'></h1>
      <img data-src='auction.image_url'>
      <span data-text='auction.timeRemaining | time'></span>

      <div class='alert-box' data-show='auction.endingSoon'>
        <p>Hurry up! This auction is ending soon.</p>
      </div>

      <dl>
        <dt>Highest Bid:</dt>
        <dd data-text='auction.bid | currency'></dd>
        <dt>Bidder:</dt>
        <dd data-text='auction.bidder'></dd>
      </dl>

      <dl>
        <dt>Bids Left:</dt>
        <dd data-text='user.bidCount'></dd>
      </dl>
    </div>

Then tell Rivets.js what model(s) to bind to it:

    rivets.bind($('#auction'), {auction: auction, user: currentUser});

## Configure

Use `rivets.configure` to configure Rivets.js for your app (or you can set configuration options manually on `rivets.config`).

#### Adapter

Rivets.js is model interface-agnostic, meaning it can work with any event-driven model by way of defining an adapter. This is the only required configuration as it's what Rivet.js uses to observe and interact with your model objects. An adapter is just an object that responds to `subscribe`, `unsubscribe`, `read` and `publish`. Here is a sample configuration with an adapter for using Rivets.js with Backbone.js.

    rivets.configure({
      adapter: {
        subscribe: function(obj, keypath, callback) {
          callback.wrapped = function(m, v) { callback(v) };
          obj.on('change:' + keypath, callback.wrapped);
        },
        unsubscribe: function(obj, keypath, callback) {
          obj.off('change:' + keypath, callback.wrapped);
        },
        read: function(obj, keypath) {
          return obj.get(keypath);
        },
        publish: function(obj, keypath, value) {
          obj.set(keypath, value);
        }
      }
    });


#### Prefix and data preloading

To prevent data attribute collision, you can set the `prefix` option to something like 'rv' or 'bind' so that data attributes are prefixed like `data-rv-text`.

    rivets.configure({
      prefix: 'rv'
    });

Set the `preloadData` option to `false` if you don't want your bindings to be bootstrapped with the current model values on bind. This option is set to `true` by default.

    rivets.configure({
      preloadData: false
    });

## Extend

Rivets.js is easily extended by adding your own custom *binding routines* and *formatters*. Rivets.js comes bundled with a few commonly used bindings, but users are encouraged to add their own that are specific to the needs of their application. 

#### Binding Routines

*Binding routines* are the functions that run when an observed attribute changes. Their sole concern is to describe what happens to the element when a new value comes in. All binding routines are publicly available on the `rivets.routines` object.

Let's say we wanted a `data-color` binding that sets the element's colour, here's what the routine function for that binding might look like:

    rivets.routines.color = function(el, value) {
      el.style.color = value;
    };

With that routine defined, the following binding will update the element's color when `model.color` changes:

    <span data-color="model.color">COLOR</span>

Available bindings out-of-the-box:

- data-text
- data-html
- data-value
- data-show
- data-hide
- data-enabled
- data-disabled
- data-checked
- data-unchecked
- data-*[attribute]*
- data-on-*[event]*
- data-each-*[item]*

#### Formatters

*Formatters* are simple one-way functions that mutate the incoming value of a binding. You can use them to format dates, numbers, currencies, etc. and because they work in a similar fashion to the Unix pipeline, the output of each feeds directly as input to the next one, so you can stack as many of them together as you like.

```
rivets.formatters.money = function(value){
  return accounting.formatMoney(value);
};

rivets.formatters.date = function(value){
  return moment(value).format('MMM DD, YYYY');
};
```

```
<span data-text="event.startDate | date"></span>
```

## Usage Notes

#### Rivets.View and Rivets.Binding

The `rivets.bind` function returns a bound `Rivets.View` instance that you should hold on to for later. You may want to unbind it's listeners with `view.unbind()` and/or rebuild it's bindings with `view.build()`. You can also access the individual `Rivets.Binding` instances inside the view through `view.bindings` — this is useful for debugging purposes or if you want to unbind or manually set the value for certain bindings.

#### Adapter Bypass

If your model object encapsulates it's attributes (e.g. `model.attributes` for Backbone.js models) and your adapter conforms to that object specifically, you can still utilize properties defined outside of that object — such as functions or other static values defined on the object root.

Just use `model:property` instead of `model.property` inside your binding declaration and Rivets.js will bypass the adapter completely and access that property as it's defined on the object root. This obviously won't sync any changes, but that is by design in this case as these properties should be mostly static and used in conjunction with other "dynamic" properties.

#### Computed Properties

Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from it's dependencies with a `>`. The following `data-text` binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

    <span data-text="event:duration > start end"></span>

#### Iteration Binding

Use the `data-each-[item]` binding to have Rivets.js automatically loop over items in an array and append bound instances of that element. Within that element you can bind to the iterated item as well as any contexts that are available in the parent view.

```
<ul>
  <li data-each-todo="list.todos">
    <input type="checkbox" data-checked="todo.done">
    <span data-text="todo.summary"></span>
  </li>
<ul>
```

If the array you're binding to contains non-model objects (they don't conform to your adapter), you can still iterate over them, just make sure to use the adapter bypass syntax — in doing so, the iteration binding will still update when the array changes, however the individual items will not since they'd be bypassing the `adapter.subscribe`.

```
<ul>
  <li data-each-link="item.links">
    <a data-href="link:url" data-text="link:title"></span>
  </li>
</ul>
```

Also note that you may bind to the iterated item directly on the parent element.

```
<ul>
  <li data-each-tag="item.tags" data-text="tag:name"></li>
</ul>
```

## Building and Testing

Make sure to run `npm install` so that you have all the development dependencies. To have the test suite run as part of the build process, you'll also need to have [PhantomJS](http://phantomjs.org) installed.

#### Building

Rivets.js uses [grunt](http://gruntjs.com/) as the build tool. Run `grunt build` from within the project root to compile + minify the source into */lib*, or just run `grunt` to have it watch the source file for changes — it will compile + minify into */lib* and run the test suite whenever the source file is saved.

#### Testing

Rivets.js uses [Jasmine](http://pivotal.github.com/jasmine/) as the testing framework. You can run the test suite with `grunt spec` or by opening */spec/index.html*.
