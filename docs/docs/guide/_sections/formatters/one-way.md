This is by far the most common and practical way to use formatters &mdash; simple read-only mutations to a value. Taking the dates example from above, we can define a `date` formatter that returns a human-friendly version of a date value.

```javascript
rivets.formatters.date = function(value){
  return moment(value).format('MMM DD, YYYY')
}
```

Formatters are applied by piping them to binding declarations using `|` as a delimiter.

```html
<span rv-text="event.startDate | date"></span>
```
