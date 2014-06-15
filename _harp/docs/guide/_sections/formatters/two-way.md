Two-way formatters are useful when you want to store a value in a particular format, such as a unix epoch time or a cent value, but still let the user input the value in a different format.

Instead of defining the formatter as a single function, you define it as an object containing `read` and `publish` functions. When a formatter is defined as a single function, Rivets assumes it to be in the read direction only. When defined as an object, Rivets uses it's `read` and `publish` functions to effectively serialize and de-serialize the value.

Using the cent value example from above, let's say we want to store a monetary value as cents but let the user input it in a dollar amount. For this we can define a two-way `currency` formatter.

```javascript
rivets.formatters.currency = {
  read: function(value) {
    return (value / Math.pow(10, n)).toFixed(2)
  },
  publish: function(value) {
    return Math.round(parseFloat(value) * Math.pow(10, 2))
  }
}
```

You can then bind using this formatter with any one-way or two-way binder.

```html
<input rv-value="item.price | currency">
```

Note that you can also chain bidirectional formatters with any other formatters, and in any order. They read from left to right, and publish from right to left, skipping any read-only formatters when publishing the value back to the model.
