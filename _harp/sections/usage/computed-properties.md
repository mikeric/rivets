Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from it's dependencies with a `<`. The following `data-text` binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

    <span data-text="event:duration < .start .end"></span>

The prepended `.` is a shorthand syntax for specifying dependencies that are on the same object as the target, so that the above declaration is effectively the same as `event:duration < event.start event.end`.
