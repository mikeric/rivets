Binders are the sets of instructions that tell Rivets.js how to update the DOM node(s) when that particular model property changes. Rivets.js comes bundled with many of the commonly used binders for conveneience, but it's encouraged to extend Rivets.js with your own that are specific to your application.

For example, you may have some custom toggle widgets, progress bars or pie charts that you'd like to bind to so that they can be updated automatically when a model property changes. For this, you would add a two-way binder for <code>toggle</code> (model-to-view and view-to-model) and one-way binders for <code>progress</code> and <code>pie</code> (model to view only) so that you can use declarations like <code>data-toggle="feature.enabled"</code> and <code>data-progress="profile.completed"</code>.

#### One-Way Binders

One-way binders simply update the DOM when a model property changes (model-to-view only). Let's say we want a simple binder that updates an element's color when the model property changes. Here we can define a one-way `color` binder as a single function. This function takes the element and the current value of the model property, which we will use to updates the element's color.

    rivets.binders.color = function(el, value) {
      el.style.color = value
    }

With the above binder defined, you can now utilize the `data-color` declaration in your views.

    <span data-color="model.color">COLOR</span>
