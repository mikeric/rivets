First, we need to create a template. Templates describe your UI in plain HTML using special prefixed attributes, DOM elements and basic text interpolation. They can go wherever you like &mdash; in the DOM, inside a document fragment, or defined as a template element. Just make sure you have a convenient way to reference them.

```html
<section id="auction">
  <h1>{ action.title }</h1>
  <img rv-src="action.image.url">

  <aside rv-show='auction.remaining | lt 120'>
    <h4>Hurry up!<h4>
    <p>This auction is ending in { auction.remaining | time }.</p>
  </aside>

  <button rv-on-click="controller.bid">Place a bid</button>
</section>
```

#### Binding the view

To create a view using the above template, simply bind some data to it. The `rivets.bind` method accepts the template element, the model data, as well as any options you wish to override from the main `rivets` object (optional).

```javascript
rivets.bind($('#auction'), {
  auction: auctionModel,
  controller: controllerObject
})
```

#### Lifecycle and unbinding

Every call to `rivets.bind` returns a bound `Rivets.View` instance that you should hold on to for later. You'll need it in order to unbind it's listeners using `view.unbind()` as shown below.

```javascript
view = rivets.bind($('#auction'), {
  auction: auctionModel,
  controller: controllerObject
})

view.unbind()
```

You can also access the individual `Rivets.Binding` instances on `view.bindings` or query them using `view.select`. This is mainly useful for debugging purposes or manually interfacing with bindings.
