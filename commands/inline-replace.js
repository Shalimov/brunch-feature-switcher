const espirma = require('esprima')
const Command = require('./base')

class InlineReplaceCommand extends Command {
  constructor(codeline) {
    super()
    this.id = InlineReplaceCommand.getId()
    // remove brackets
    this.codeline = codeline.substr(1, codeline.length - 2)
    this.placeholder = `__reinline${this.id}__`
    this.placeholderAST = espirma.parseScript(`'${this.placeholder}'`)
  }

  static getId() {
    return InlineReplaceCommand.id++
  }

  static create(args) {
    return new InlineReplaceCommand(args)
  }
  
  execute() {
    return this.placeholderAST
  }

  postProcess(code) {
    return code.replace(`'${this.placeholder}'`, this.codeline)
  }
}

InlineReplaceCommand.id = 1

module.exports = InlineReplaceCommand
