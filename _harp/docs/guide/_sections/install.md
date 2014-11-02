You can grab the latest stable release [here](/dist/rivets.min.js) or install using the package manager of your choice. We currently maintain releases on npm, component, jam and bower (recommended).

```bash
bower install rivets
```

Rivets' only hard dependency is [Sightglass](https://github.com/mikeric/sightglass). If you wish to include Sightglass separately, just make sure to include it first.

```html
<script src="bower_components/sightglass/index.js"></script>
<script src="bower_components/rivets/dist/rivets.min.js"></script>
```

Alternatively you can just include the bundled distribution if Rivets, which contains both libraries.

```html
<script src="bower_components/rivets/dist/rivets.bundled.min.js"></script>
```

*Note that Rivets unconditionally occupies a `rivets` global but CommonJS and AMD module loaders such as [RequireJS](http://requirejs.org/) and [almond](https://github.com/jrburke/almond) are fully supported as well, if that's your thing.*
