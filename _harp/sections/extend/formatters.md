Formatters are functions that mutate the incoming and/or outgoing value of a binding. You can use them to format dates, numbers, currencies, etc. and because they work in a similar fashion to the Unix pipeline, the output of each feeds directly as input to the next one, so you can stack as many of them together as you like.

#### One-Way Formatters

This is by far the most common and practical way to use formatters --- simple read-only mutations to a value. Taking the dates example from above, we can define a `date` formatter that returns a human-friendly version of a date value.

    rivets.formatters.date = function(value){
      return moment(value).format('MMM DD, YYYY')
    }

Formatters are applied by piping them to binding declarations using `|` as a delimiter.

    <span data-text="event.startDate | date"></span>

#### Two-Way Formatters

Two-way formatters are useful when you want to store a value in a particular format, such as a unix epoch time or a cent value, but still let the user input the value in a different format.

Instead of defining the formatter as a single function, you define it as an object containing `read` and `publish` functions. When a formatter is defined as a single function, Rivets assumes it to be in the read direction only. When defined as an object, Rivets uses it's `read` and `publish` functions to effectively serialize and de-serialize the value.

Using the cent value example from above, let's say we want to store a monetary value as cents but let the user input it in a dollar amount. For this we can define a two-way `currency` formatter imlemented below.

    rivets.formatters.currency = {
      read: function(value) {
        return (value / Math.pow(10, n)).toFixed(2)
      },
      publish: function(value) {
        return Math.round(parseFloat(value) * Math.pow(10, 2))
      }
    }

Note that you can also chain bidirectional formatters with any other formatters, and in any order. They read from left to right, and publish from right to left, skipping any read-only formatters when publishing the value back to the model.

#### Formatter Arguments

Need to pass arguments to your formatter? Not a problem.

    <span data-text="billing.cardNumber | mask 4 4 ********"></span>

Note that all arguments are passed in as strings, so you will need to do your own type conversions to primitives if necessary.

    rivets.formatters.mask = function(value, left, right, mask) {
      formatted = value.substring(0, left)
      formatted + mask
      formatted += value.substring(value.length - right)

      return formatted
    }
