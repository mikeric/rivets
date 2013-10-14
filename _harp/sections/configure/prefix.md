To prevent data attribute collision, you can set the `prefix` option to something like `rv` so that your data binding attributes are accessed as `data-rv-text` instead of just `data-text`.

    rivets.configure({
      prefix: 'rv'
    })

Set the `preloadData` option to `false` if you don't want your bindings to be bootstrapped with the current model values on bind. This option is set to `true` by default.

    rivets.configure({
      preloadData: false
    })
