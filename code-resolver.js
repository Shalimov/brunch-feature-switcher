const esprima = require('esprima')
const estra = require('estraverse')
const esc = require('escodegen')
const fp = require('lodash/fp')

const MARKER = '@feature'

const commentParser = fp.flow(
  fp.filter(fp.flow(fp.prop('value'), fp.trim, fp.startsWith('@feature'))),
  fp.flatMap((v) => {
    const words = fp.flow(fp.replace(MARKER, ''), fp.words)
    return fp.map((feature) => ({
      feature,
      loc: v.loc,
    }), words(v.value))
  })
)

const featureDetector = (featuresSwitchedOn, comments) => {
  const featuresSet = new Set(featuresSwitchedOn)
  const parsedComments = commentParser(comments)
  const unavailableFeatures = parsedComments.filter(v => !featuresSet.has(v.feature))

  return (codeLoc) => fp.some(
    f => (
      f.loc.start.line + 1 === codeLoc.start.line &&
      f.loc.start.column === codeLoc.start.column
    ),
    unavailableFeatures
  )
}

const isExpectedType = fp.includes(fp.placeholder, [
  esprima.Syntax.Property,
  esprima.Syntax.FunctionDeclaration,
  esprima.Syntax.FunctionExpression,
  esprima.Syntax.VariableDeclaration,
  esprima.Syntax.ReturnStatement,
  esprima.Syntax.MethodDefinition,
  esprima.Syntax.ClassDeclaration,
])

module.exports = function (code, options) {
  const opts = Object.assign({
    type: 'module',
    features: [],
  }, options)

  if (!fp.includes(MARKER, code)) {
    return code
  }

  const esParse = opts.type === 'module' ? 'parseModule' : 'parseScript'
  const ast = esprima[esParse](script, { comment: true, loc: true })
  const detect = featureDetector(opts.features, ast.comments)

  const modifiedAst = estra.replace(ast, {
    enter(node) {
      if (detect(node.loc) && isExpectedType(node.type)) {
        this.remove()
      }
    }
  })

  return esc.generate(modifiedAst)
}