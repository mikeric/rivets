---
title: Usage Notes
anchor: usage-notes
---

### Rivets.View and Rivets.Binding

The `rivets.bind` function returns a bound `Rivets.View` instance that you should hold on to for later. You may want to unbind it's listeners with `view.unbind()` and/or rebuild it's bindings with `view.build()`. You can also access the individual `Rivets.Binding` instances inside the view through `view.bindings` &mdash; this is useful for debugging purposes or if you want to unbind or manually set the value for certain bindings.

### Adapter Bypass

If your model object encapsulates it's attributes (e.g. `model.attributes` for Backbone.js models) and your adapter conforms to that object specifically, you can still utilize properties defined outside of that object, such as functions or other static values defined on the object root.

Just use `model:property` instead of `model.property` inside your binding declaration and Rivets.js will bypass the adapter completely and access that property as it's defined on the object root. This obviously won't sync any changes, but that is by design in this case as these properties should be mostly static and used in conjunction with other "dynamic" properties.

### Computed Properties

Computed properties are functions that get re-evaluated when one or more dependent properties change. Declaring computed properties in Rivets.js is simple, just separate the function from it's dependencies with a *<*. The following `data-text` binding will get re-evaluated with `event.duration()` when either the event's `start` or `end` attribute changes.

{% highlight html %}
<span data-text="event:duration < .start .end"></span>
{% endhighlight %}

The prepended `.` is a shorthand syntax for specifying dependencies that are on the same object as the target, so that the above declaration is effectively the same as `event:duration < event.start event.end`.

### Iteration Binding

Use the `data-each-[item]` binding to have Rivets.js automatically loop over items in an array and append bound instances of that element. Within that element you can bind to the iterated item as well as any contexts that are available in the parent view.

{% highlight html %}
<ul>
  <li data-each-todo="list.todos">
    <input type="checkbox" data-checked="todo.done">
    <span data-text="todo.summary"></span>
  </li>
<ul>
{% endhighlight %}

If the array you're binding to contains non-model objects (they don't conform to your adapter), you can still iterate over them, just make sure to use the adapter bypass syntax &mdash; in doing so, the iteration binding will still update when the array changes, however the individual items will not since they'd be bypassing the `adapter.subscribe`.

{% highlight html %}
<ul>
  <li data-each-link="item.links">
    <a data-href="link:url" data-text="link:title"></a>
  </li>
</ul>
{% endhighlight %}

Also note that you may bind to the iterated item directly on the parent element.

{% highlight html %}
<ul>
  <li data-each-tag="item.tags" data-text="tag:name"></li>
</ul>
{% endhighlight %}
