Use the `rv-each-[item]` binder to have Rivets.js automatically loop over items in an array and append bound instances of that element. Within that element you can bind to the iterated item as well as any contexts that are available in the parent view.

```html
<ul>
  <li rv-each-todo="list.todos">
    <input type="checkbox" rv-checked="todo.done">
    <span>{ todo.summary }</span>
  </li>
<ul>
```
