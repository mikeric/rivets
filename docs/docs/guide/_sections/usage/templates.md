Templates describe your UI in plain HTML. You can define them directly in the document, use template elements or store and load them however you like. Just make sure you have a convenient way to reference your templates when you want to bind some data to them.

```html
<section id="auction">
  <h3>{ auction.product.name }</h3>
  <p>Current bid: { auction.currentBid | money }</p>

  <aside rv-if="auction.timeLeft | lt 120">
    Hurry up! There is { auction.timeLeft | time } left.
  </aside>
</section>
```

The important parts to note here are the attributes prefixed with `rv-` and portions of text wrapped in `{ ... }`. These are binding declarations and they are the sole way that Rivets.js ties data to your templates. The values of these declarations all follow the same minimal and expressive syntax.

```
(keypath | primitive) [formatters...]
```

Keypaths get observed and will recompute the binding when any intermediary key changes. A primitive can be a string, number, boolean, null or undefined.

[Formatters](#formatters) can be piped to values using `|` and they follow a similarly minimal yet expressive syntax. [Formatter arguments](#formatters-arguments) can be keypaths or primitives. Keypath arguments get observed and will recompute the binding when any intermediary key changes.

```
(formatter) [keypath | primitive...]
```
