const fp = require('lodash/fp')

const Feature = require('./feature')

class FeatureController {
  constructor(features) {
    this.features = features
  }

  static hasFeatureComments(code) {
    return fp.includes(FeatureController.MARKER, code)
  }

  static splitFeatures(featureCmd) {
    const { MARKER } = FeatureController
    const startIndex = featureCmd.indexOf(MARKER) + MARKER.length
    const features = []
  
    for (let i = startIndex, l = featureCmd.length; i < l; i += 1) {
      let feature = ''
      let insideExpr = false
      let symb = featureCmd.charAt(i)
  
      if (symb === ' ' || symb == ',') continue
  
      while (i < l) {
        symb = featureCmd.charAt(i++)
        
        if ((symb === ' ' || symb == ',') && !insideExpr) break
  
        feature += symb
  
        if (symb === '{') {
          insideExpr = true
        } else if (symb === '}') {
          insideExpr = false
        }
      }
      
      features.push(feature)
    }
  
    return features
  }

  static fromASTComments(comments) {
    const commentParser = fp.flow(
      fp.filter(fp.flow(fp.prop('value'), fp.includes(FeatureController.MARKER))),
      fp.flatMap((comment) => fp.map(
        feature => Feature.parse({ featureCmd: feature, location: comment.loc }),
        FeatureController.splitFeatures(comment.value)
      ))
    )

    const features = commentParser(comments)
    return new FeatureController(features)
  }

  configureFeatures(config) {
    this.features.forEach((feature) => {
      const isActive = Boolean(config[feature.name])
      feature.setStatus(isActive)
    })
  }

  execNodeCommand(node) {
    const feature = this.features.find(feature => feature.isNodeRelated(node))

    if (feature) {
      return feature.execute()
    }
  }

  postProcess(code) {
    return this.features.reduce((code, feature) => feature.postProcess(code), code)
  }
}

FeatureController.MARKER = '@feature'
FeatureController.MATCHER = /([a-zA-Z0-9_:]+)/g

module.exports = FeatureController
