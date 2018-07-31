const esprima = require('esprima')
const estra = require('estraverse')
const esc = require('escodegen')
const fp = require('lodash/fp')

const MARKER = '@feature'

const matcher = /([a-zA-Z0-9_:]+)/g
const parseFeature = (feature) => {
  if (feature.includes(':')) {
    const [featureName, opt] = feature.split(':')

    return {
      feature: featureName,
      reversed: opt === 'false'
    }
  }

  return {
    feature,
    reversed: false
  }
}
const commentParser = fp.flow(
  fp.filter(fp.flow(fp.prop('value'), fp.trim, fp.startsWith('@feature'))),
  fp.flatMap((v) => {
    const words = fp.flow(fp.replace(MARKER, ''), fp.invokeArgs('match', [matcher]))
    return fp.map((feature) => ({
      ...parseFeature(feature),
      loc: v.loc,
    }), words(v.value))
  })
)

const featureDetector = (featuresSwitchedOn, comments) => {
  const featuresSet = new Set(featuresSwitchedOn)
  const parsedComments = commentParser(comments)
  const unavailableFeatures = parsedComments.filter(
    v => (
      v.reversed ?
        featuresSet.has(v.feature) :
        !featuresSet.has(v.feature))
  )

  return (codeLoc) => fp.some(
    f => (
      f.loc.start.line + 1 === codeLoc.start.line &&
      f.loc.start.column === codeLoc.start.column
    ),
    unavailableFeatures
  )
}

module.exports = function (code, options) {
  const opts = Object.assign({
    type: 'module',
    features: [],
  }, options)

  if (!fp.includes(MARKER, code)) {
    return code
  }

  const esParse = opts.type === 'module' ? 'parseModule' : 'parseScript'
  const ast = esprima[esParse](code, { comment: true, loc: true, range: true })
  const detect = featureDetector(opts.features, ast.comments)

  const modifiedAst = estra.replace(ast, {
    enter(node) {
      if (node && detect(node.loc)) {
        this.remove()
      }
    }
  })

  return esc.generate(modifiedAst)
}