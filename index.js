const fp = require('lodash/fp')
const resolver = require('./code-resolver')

class FeatureSwitcherPlugin {
  constructor(config) {
    // Replace 'plugin' with your plugin's name.
    // Don't include 'brunch' or 'plugin' words in configuration key.
    this.config = config.plugins.featureSwitcher || {}
    this.features = fp.flow(
      fp.prop('features'),
      fp.entries,
      fp.filter(fp.nth(1)),
      fp.map(fp.first)
    )(this.config)
  }

  // file: File => Promise[File]
  // Transforms a file data to different data. Could change the source map etc.
  // Examples: JSX, CoffeeScript, Handlebars, SASS.
  compile(file) {
    const cleanCode = resolver(file.data, { features: this.features })
    return Promise.resolve(Object.assign(file, { data: cleanCode }))
  }
}

// Required for all Brunch plugins.
FeatureSwitcherPlugin.prototype.brunchPlugin = true
FeatureSwitcherPlugin.prototype.type = 'javascript'
FeatureSwitcherPlugin.prototype.extension = 'js'

module.exports = FeatureSwitcherPlugin
