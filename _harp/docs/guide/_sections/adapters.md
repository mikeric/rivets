Rivets.js is agnostic about the objects that it can subscribe to. This makes it very flexible as it can adapt to work with virtually any library or framework, but it also means that you need to tell Rivets.js *how* to subscribe to those objects. This is where adapters come in to play. This feature is driven by the [Sightglass](https://github.com/mikeric/sightglass) library.

Each adapter is defined to a unique interface (a single character) which is used to separate the keys in a keypath. The interfaces used in a keypath determine which adapter to use for each intermediary key.

```
user.address:city
```

The above keypath will use the `.` adapter to access the `address` key on the `user` object, and the `:` adapter to access the `city` key on the `address` object. If you can imagine for a second that `address` is just a normal property on the user object pointing to a Backbone model, but `city` is actually an attribute on that Backbone model, you can see how this kind of notation is actually very succint and expressive.
