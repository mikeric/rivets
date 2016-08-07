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
