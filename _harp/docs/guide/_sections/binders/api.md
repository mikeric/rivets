#### binder.bind

This function will get called for this binding on the initial `view.bind()`. Use it to store some initial state on the binding, or to set up any event listeners on the element.

#### binder.unbind

This function will get called for this binding on `view.unbind()`. Use it to reset any state on the element that would have been changed from the routine getting called, or to unbind any event listeners on the element that you've set up in the `binder.bind` function.

#### binder.routine

The routine function is called when an observed attribute on the model changes and is used to update the DOM. When defining a one-way binder as a single function, it is actually the routine function that you're defining.

#### binder.getValue
The getValue function is called when the binder wants to set the value on the model. This function takes the HTML element as only parameter

#### binder.publishes

Set this to true if you want view.publish() to call publish on these bindings.

#### binder.block

Blocks the current node and child nodes from being parsed (used for iteration binding as well as the if/unless binders).