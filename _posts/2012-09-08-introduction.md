---
title: Rivets.js
anchor: rivets
---

Rivets.js is a declarative data binding facility that plays well with existing frameworks such as [Backbone.js](http://backbonejs.org), [Spine.js](http://spinejs.com) and [Stapes.js](http://hay.github.com/stapes/). It aims to be lightweight (**2.3KB** minified and gzipped), extensible, and configurable to work with any event-driven model.

Rivets.js keeps your UI and model data in sync for you, so you can spend less time manually tying into the DOM and more time on your actual data and application logic.

Out-of-the-box it's got:

- **One-way** and **two-way** binding to/from DOM elements.
- **Computed properties** with dependent attributes.
- **Formatters** to allow mutatating values through piping.
- **Iteration binding** with full context support.
- **Easy debugging** and **manual syncing** of bindings.

Describe your UI in plain HTML using data attributes:

{% highlight html %}
<div id="auction">
  <h1 data-text="auction.title"></h1>
  <img data-src="image.url">

  <div class='info' data-show='auction.endingSoon'>
    <p>Hurry up! This auction is ending soon.</p>
  </div>

  <dl>
    <dt>Current Bid</dt>
    <dd data-text='auction.currentBid | money'></dd>
    <dt>Time left</dt>
    <dt data-text='auction.remaining | time'></dt>
  </dl>
</div>
{% endhighlight %}

Then tell Rivets.js what model(s) to bind to it:

{% highlight javascript %}
rivets.bind($('#auction'), {auction: auction})
{% endhighlight %}

