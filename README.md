# Rivets.js

Rivets.js is a declarative data binding facility that plays well with existing frameworks such as [Backbone.js](http://backbonejs.org), [Spine.js](http://spinejs.com) and [Stapes.js](http://hay.github.com/stapes/). It aims to be lightweight (1.4KB minified and gzipped), extensible, and configurable to work with any event-driven model.

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

Use `rivets.configure` to configure Rivets.js for your app (or set them manually on `rivets.config`). There are a few handy configuration options, such as setting the data attribute prefix and adding formatters that you can pipe binding values to, but setting the adapter is the only required configuration since Rivets.js needs to know how to observe your models for changes as they happen.

#### Adapter

Rivets.js is model interface-agnostic, meaning it can work with any event-driven model by way of defining an adapter. An adapter is just an object that responds to `subscribe`, `unsubscribe`, `read` and `publish`. Here is a sample configuration with an adapter for using Rivets.js with Backbone.js.

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

#### Formatters

Formatters are simple one-way functions that mutate the incoming value of a binding. You can use them to format dates, numbers, currencies, etc. and because they work in a similar fashion to the Unix pipeline, the output of each feeds directly as input to the next one, so you can stack as many of them together as you like.

    rivets.configure({
      formatters: {
        money: function(value){
          return accounting.formatMoney(value);
        },
        date: function(value){
          return moment(value).format('MMM DD, YYYY');
        }
      }
    });

#### Prefix and data preloading

To prevent data attribute collision, you can set the `prefix` option to something like 'rv' or 'bind' so that data attributes are prefixed like `data-rv-text`.

Set the `preloadData` option to `true` or `false` depending on if you want the binding routines to run immediately after the initial binding or not — if set to false, the binding routines will only run when the attribute value is updated.

## Extend

Rivets.js comes bundled with a few commonly used bindings, but users are encouraged to add their own that are specific to the needs of their application. Rivets.js is easily extended by adding your own binding routines. *Binding routines* are the functions that run when an observed attribute changes. Their sole concern is to describe what happens to the element when a new value comes in. All binding routines are publicly available on the `rivets.routines` object.

Let's say we wanted a `data-color` binding that sets the element's colour, here's what the routine function for that binding might look like:

    rivets.routines.color = function(el, value) {
      el.style.color = value;
    };

With that routine defined, the following binding will update the element's color when `model.color` changes:

    <span data-color="model.color">COLOR</span>

#### Available bindings out-of-the-box

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

## Usage Notes

#### Rivets.View and Rivets.Binding

The `rivets.bind` function returns a bound `Rivets.View` instance that you should hold on to for later. You may want to unbind it's listeners with `view.unbind()` and/or rebuild it's bindings with `view.build()`. You can also access the individual `Rivets.Binding` instances inside the view through `view.bindings` — this is useful for debugging purposes or if you want to unbind or manually set the value for certain bindings.

#### Iteration Binding

Even though a binding routine for `each-item` will likely be included in Rivets.js, you can use the `data-html` binding along with a set of formatters in the interim to do sorting and iterative rendering of collections (amongst other cool things).

    <ul data-html="model.tags | sort | tagList"></ul>

## Building and Testing

Before proceeding, make sure to run `npm install` so that you have all the development dependencies.

#### Building

Rivets.js uses [grunt](http://gruntjs.com/) as the build tool. Run `grunt` from within the project root and it will compile + minify into */lib* whenever the source file is saved. You can also run `grunt build` to rebuild the project manually.

#### Testing

Rivets.js uses [Jasmine](http://pivotal.github.com/jasmine/) as the testing framework. You can run the tests by opening */spec/index.html*.
