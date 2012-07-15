# Rivets.js

Rivets.js is a declarative data binding facility that plays well with existing frameworks such as [Backbone.js](http://backbonejs.org), [Spine.js](http://spinejs.com) and [Stapes.js](http://hay.github.com/stapes/). It aims to be lightweight (1.2KB minified and gzipped), extensible, and configurable to work with any event-driven model.

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

Use `rivets.configure` to configure Rivets.js for your app. There are a few handy configuration options, such as setting the data attribute prefix and adding formatters that you can pipe binding values to, but setting the adapter is the only required configuration since Rivets.js needs to know how to observe your models for changes as they happen.

#### Adapter

Rivets.js is model interface-agnostic, meaning it can work with any event-driven model by way of defining an adapter. An adapter is just an object that responds to `subscribe`, `read` and `publish`. Here is a sample configuration with an adapter for using Rivets.js with Backbone.js.

    rivets.configure({
      adapter: {
        subscribe: function(obj, keypath, callback) {
          obj.on('change:' + keypath, function(m, v) { callback(v) });
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

You can extend Rivets.js by adding your own custom data bindings (routines). Just pass `rivets.register` an identifier and a routine function. Routine functions take two arguments, `el` which is the DOM element and `value` which is the incoming value of the attribute being bound to.

So let's say we wanted a `data-color` binding that sets the element's colour. Here's what that might look like:

    rivets.register('color', function(el, value){
      el.style.color = value;
    });

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
- data-selected
- data-*[attribute]*
- data-on-*[event]*

## Building

#### Requirements
 * Ruby
 * Bundler

#### Steps
  1. Run `bundle` to install all the required gems.
  2. Run `rake build` or simply `rake`.

## Testing

You can run the tests by opening the `test.html` file.
While developing there is a guard file you can use to compile your changes,
simply run `guard` start it and Rivets will be recompiled when saving.
