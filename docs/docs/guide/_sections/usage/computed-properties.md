Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from its dependencies with a `<`. The following text binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

```html
<span rv-text="event.duration < start end"></span>
```

Note that the dependency keypaths stem from the target object, not the view's model context. So for the above declaration, the target is the `event` object, with dependencies on `event.start` and `event.end`.
