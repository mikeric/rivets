---
title: Configure
anchor: configure
---

Use `rivets.configure` to configure Rivets.js for your app (or you can set configuration options manually on `rivets.config`).

#### Adapter

Rivets.js is model interface-agnostic, meaning it can work with any event-driven model by way of defining an adapter. This is the only required configuration as it's what Rivet.js uses to observe and interact with your model objects. An adapter is just an object that responds to `subscribe`, `unsubscribe`, `read` and `publish`. Here is a sample configuration with an adapter for using Rivets.js with Backbone.js.

{% highlight javascript %}
rivets.configure({
  adapter: {
    subscribe: function(obj, keypath, callback) {
      obj.on('change:' + keypath, callback)
    },
    unsubscribe: function(obj, keypath, callback) {
      obj.off('change:' + keypath, callback)
    },
    read: function(obj, keypath) {
      return obj.get(keypath)
    },
    publish: function(obj, keypath, value) {
      obj.set(keypath, value)
    }
  }
})
{% endhighlight %}

#### Prefix and data preloading

To prevent data attribute collision, you can set the `prefix` option to something like 'rv' or 'bind' so that data attributes are prefixed like `data-rv-text`.

{% highlight javascript %}
rivets.configure({
  prefix: 'rv'
})
{% endhighlight %}

Set the `preloadData` option to `false` if you don't want your bindings to be bootstrapped with the current model values on bind. This option is set to `true` by default.

{% highlight javascript %}
rivets.configure({
  preloadData: false
})
{% endhighlight %}
