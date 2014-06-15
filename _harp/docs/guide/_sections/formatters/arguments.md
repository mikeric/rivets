Need to pass arguments to your formatter? Not a problem.

```html
<span rv-text="billing.cardNumber | mask 4 4 ********"></span>
```

Note that all arguments are passed in as strings, so you will need to do your own type conversions to primitives if necessary.

```javascript
rivets.formatters.mask = function(value, left, right, mask) {
  formatted = value.substring(0, left)
  formatted + mask
  formatted += value.substring(value.length - right)
  return formatted
}
```
