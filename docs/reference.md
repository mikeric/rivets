## text

Sets the element's text content.

```html
<h1 rv-text="user.name"></h1>
```

You can also bind text using interpolation.

```html
<p>{ user.name } is { user.age } years old.</p>
```

## html

Sets the element's HTML content.

```html
<section rv-html="item.summary"></section>
```

## show

Shows the element when the value evaluates to true and hides the element when the value evaluates to false.

```html
<button rv-show="user.admin">Remove</button>
```

## hide

Hides the element when the value evaluates to true and shows the element when the value evaluates to false.

```html
<section rv-hide="feature.disabled"></section>
```

## enabled

Enables the element when the value evaluates to true and disables the element when the value evaluates to false.

```html
<button rv-enabled="user.canVote">Upvote</button>
```

## disabled

Disables the element when the value evaluates to true and enables the element when the value evaluates to false.

```html
<button rv-disabled="user.suspended">Upvote</button>
```

## if

Inserts and binds the element as well as it's child nodes into the DOM when the value evaluates to true and removes / unbinds the element when the value evaluates to false.

```html
<section rv-if="item.editable"></section>
```

## unless

Removes and unbinds the element as well as it's child nodes when the value evaluates to true and inserts / binds the element when the value evaluates to false.

```html
<section rv-unless="item.locked"></section>
```

## value

Sets the element's value when the attribute changes and sets the bound object's value when the input element changes from user input (two-way).

```html
<input rv-value="item.name">
```

## checked

Checks the input when the value evaluates to true and unchecks the input when the value evaluates to false. This also sets the bound object's value to true/false when the user checks/unchecks the input (two-way).

*Use this instead of value when binding to checkboxes or radio buttons.*

```html
<input type="checkbox" rv-checked="item.enabled">
```

## unchecked

Unchecks the input when the value evaluates to true and checks the input when the value evaluates to false. This also sets the bound object's value to false/true when the user checks/unchecks the input (two-way).

*Use this instead of value when binding to checkboxes or radio buttons.*

```html
<input type="checkbox" rv-unchecked="item.disabled">
```

## on-[event]

Binds an event listener on the element using the event specified in `[event]` and the bound object (should return a function) as the callback.

*If the end value of the binding changes to a different function, this binder will automatically unbind the old callback and bind a new listener to the new function.*

```html
<button rv-on-click="item.destroy">Remove</button>
```

## each-[item]

Appends a new instance of the element in place for each item in an array. Each element is bound with a completely new nested view that contains an additional property (named whatever value is in place of `[item]`) which points to the current iterated item in the array.

*Also note that you may bind to the iterated item directly on the parent element which contains the actual `rv-each` declaration.*

```html
<ul>
  <li rv-each-todo="todos">
    <input type="checkbox" rv-checked="todo.done"> { todo.name }
  </li>
<ul>
```

## class-[classname]

Adds a class (whatever value is in place of `[classname]`) on the element when the value evaluates to true and removes that class if the value evaluates to false.

```html
<li rv-class-completed="todo.done">{ todo.name }</li>
```

## [attribute]

Sets the value of an attribute (whatever value is in place of `[attribute]`) on the element.

*If your binding declaration does not match any of the above routines, it will fallback to use this binding.*

```html
<input type="text" rv-placeholder="field.placeholder">
```
