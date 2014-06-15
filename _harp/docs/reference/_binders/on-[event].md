Binds an event listener on the element using the event specified in `[event]` and the bound object (should return a function) as the callback.

*If the end value of the binding changes to a different function, this binder will automatically unbind the old callback and bind a new listener to the new function.*

```html
<button rv-on-click="item.destroy">Remove</button>
```
