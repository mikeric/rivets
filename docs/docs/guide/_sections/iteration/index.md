To access the index of the current iteration use the syntax `%item%`, Where `item` is the name of the model you provided in `rv-each-[item]`.  You can also access the index of the iteration by using the key `index` but using this will access only the current iterations index. Note that when nesting `rv-each`'s the parent index is still accessible within the scope via the model name.

```html
<ul>
  <li rv-each-user="app.users">
    <span>User Index : { %user% }</span>

    <ul>
        <li rv-each-comment="user.comments">
            <span>Comment Index : { %comment% }</span>

            <span>User Index : { %user% }</span>
        </li>
    </ul>
  </li>
<ul>
```
