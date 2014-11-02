Use the `rv-each-[item]` binding to have Rivets.js automatically loop over items in an array and append bound instances of that element. Within that element you can bind to the iterated item as well as any contexts that are available in the parent view.

```html
<ul>
  <li rv-each-todo="list.todos">
    <input type="checkbox" rv-checked="todo.done">
    <span>{ todo.summary }</span>
  </li>
<ul>
```

Also note that you may bind to the iterated item directly on the parent element.

```html
<ul>
  <li rv-each-tag="item.tags" rv-text="tag:name"></li>
</ul>
```
