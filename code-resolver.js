const esprima = require('esprima')
const estra = require('estraverse')
const esc = require('escodegen')

const FeatureController = require('./features/controller')

module.exports = function (code, options) {
  const opts = Object.assign({
    type: 'module',
    features: {},
  }, options)

  if (!FeatureController.hasFeatureComments(code)) {
    return code
  }

  const esParse = opts.type === 'module' ? 'parseModule' : 'parseScript'
  const ast = esprima[esParse](code, { comment: true, loc: true, range: true })

  const featureController = FeatureController.fromASTComments(ast.comments)
  featureController.configureFeatures(opts.features)

  const modifiedAst = estra.replace(ast, {
    enter: node => featureController.execNodeCommand(node)
  })

  return featureController.postProcess(esc.generate(modifiedAst))
}