Binds an event listener on the element using the event specified in `[event]` and the bound object (should return a function) as the callback.

*If the end value of the binding changes to a different function, this binder will automatically unbind the old callback and bind a new listener to the new function.*

```html
<button rv-on-click="item.destroy">Remove</button>
```

*The callback function is passed 1: an event object and 2: the bound context which will also include named refrences to nested bindings.*

```html
<ul>
  <li rv-each-a="view.a">
    <ul>
      <li rv-each-b="a.b">
        <button rv-on-click="view.clicked">third</button>
      <li>
    </ul>
  <li>
</ul>
```

```javascript
view = {
	a: [ { b:[ { "..." } ] } ],
	clicked: function(e, bound){
		console.log(bound);
	}
}

rivets.bind(el, {view: view});
```

```
//console output:
{
	view: {...}, 
	b: {...}, 
	a: {...}, 
	index:n
}
```

*Also note that the arguments passed to the event callback can be [reconfigured](/docs/guide/#usage-configuring) through the `handler` property.*