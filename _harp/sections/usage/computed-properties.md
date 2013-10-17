Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from it's dependencies with a `<`. The following text binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

```html
<span rv-text="event.duration < start end"></span>
```
