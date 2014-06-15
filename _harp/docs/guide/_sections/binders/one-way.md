One-way binders simply update the DOM when a model property changes (model-to-view only). Let's say we want a simple binder that updates an element's color when the model property changes. Here we can define a one-way `color` binder as a single function. This function takes the element and the current value of the model property, which we will use to updates the element's color.

```javascript
rivets.binders.color = function(el, value) {
  el.style.color = value
}
```

With the above binder defined, you can now utilize the `rv-color` declaration in your views.

```html
<button rv-color="label.color">Apply</button>
```
