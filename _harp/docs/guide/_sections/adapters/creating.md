Adapters are defined on `rivets.adapters` with the interface as the property name and the adapter object as the value. An adapter is just an object that responds to `subscribe`, `unsubscribe`, `read` and `publish`. The following `:` adapter works sufficiently for Backbone.js models / Stapes.js modules.

```javascript
rivets.adapters[':'] = {
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
```
