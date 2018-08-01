const fp = require('lodash/fp')

const Command = require('../commands')

class Feature {
  constructor() {
    this.name = null
    this.command = null
    this.when = null
    this.location = null
    this.actualStatus = null
  }

  static parse({ featureCmd, location }) {
    const [name, when, cmd, ...args] = featureCmd.split(':')
    const feature = new Feature()

    feature.name = name
    feature.when = when
    feature.location = location
    feature.command = Command.parse(cmd, args)

    return feature
  }

  setStatus(isActive) {
    this.actualStatus = isActive === true ? 'on' : 'off'
  }

  isNodeRelated(node) {
    const nline = fp.get('loc.start.line', node)
    const ncolumn = fp.get('loc.start.column', node)

    const fline = fp.get('start.line', this.location)
    const fcolumn = fp.get('start.column', this.location)

    return ((fline - nline + 1) + (fcolumn - ncolumn)) === 0
  }

  execute() {
    if (this.actualStatus === this.when) {
      return this.command.execute()
    }
  }

  postProcess(code) {
    return this.command.postProcess(code)
  }
}

module.exports = Feature
