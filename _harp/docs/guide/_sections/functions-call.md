To call a function in an expression, rivets includes a special formatter `call`. This formatter will call the function, any formatter parameter will become an argument sent to the function. The following text binding will call the function `event.duration` with the two arguments `event.start` and `event.end`.

```html
<span rv-text="event.duration | call event.start event.end"></span>
```
`event.duration` will be called again every time `event.start` and `event.end` change
