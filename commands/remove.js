const estra = require('estraverse')
const Command = require('./base')

class RemoveCommand extends Command {
  static create() {
    return new RemoveCommand()
  }
  
  execute() {
    return estra.VisitorOption.Remove
  }
}

module.exports = RemoveCommand
