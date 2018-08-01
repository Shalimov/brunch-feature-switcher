const RemoveCmd = require('./remove')
const InlineReplaceCmd = require('./inline-replace')

class CommandFactory {
  static parse(cmd, args) {
    switch(cmd) {
      case 'inl_replace': return InlineReplaceCmd.create(...args)
      default: return RemoveCmd.create(...args)
    }
  }
}

module.exports = CommandFactory
