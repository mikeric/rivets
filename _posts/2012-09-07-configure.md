---
title: Configure
anchor: configure
---

Use `rivets.configure` to set the following configuration options for your app. Note that all configuration options can be overridden locally to a particular view if needed.

### Adapter

Rivets.js is agnostic about the objects that it can subscribe to. This makes it very flexible as it can adapt to work with virtually any object, but it also means that you need to tell Rivets.js *how* to subscribe to them. This is where the adapter comes in.

It is required to define an adapter because Rivets.js relies solely on the adapter to observe and interact with your model objects. An adapter is just an object that responds to `subscribe`, `unsubscribe`, `read` and `publish`.

A simple adapter for using Rivets.js with Backbone.js / Stapes.js models.

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

### Prefix & Data Preloading

To prevent data attribute collision, you can set the `prefix` option to something like `rv` so that your data binding attributes are accessed as `data-rv-text` instead of just `data-text`.

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
