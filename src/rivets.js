import {OPTIONS, EXTENSIONS} from './constants'

const rivets = {
  // Global binders.
  binders: {},

  // Global components.
  components: {},

  // Global formatters.
  formatters: {},

  // Global sightglass adapters.
  adapters: {},

  // Default attribute prefix.
  prefix: 'rv',

  // Default template delimiters.
  templateDelimiters: ['{', '}'],

  // Default sightglass root interface.
  rootInterface: '.',

  // Preload data by default.
  preloadData: true,

  // Default event handler.
  handler: function(context, ev, binding) {
    this.call(context, ev, binding.view.models)
  },

  // Merges an object literal into the corresponding global options.
  configure: (options = {}) => {
    Object.keys(options).forEach(option => {
      let value = options[option]

      if (EXTENSIONS.indexOf(option) > -1) {
        Object.keys(value).forEach(key => {
          this[option][key] = value[key]
        })
      } else {
        this[option] = value
      }
    })
  }
}

export default rivets
