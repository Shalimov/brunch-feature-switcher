const resolver = require('../code-resolver')

console.log(
  resolver(
    `
    import fp from 'lodash/fp'
    import { types, flow, getSnapshot } from 'mobx-state-tree'
    import services from 'services'
    
    const { tenantService } = services
    
    const nullableStringType = types.maybe(types.string)
    
    const APIKeyModelScheme = {
      id: types.string,
      name: types.string,
      description: nullableStringType,
      createdDate: types.maybe(types.Date),
      free: types.optional(types.boolean, true),
      active: types.optional(types.boolean, false),
      value: types.string,
    }
    
    const TenantContactModelSceheme = {
      firstName: nullableStringType,
      lastName: nullableStringType,
      email: nullableStringType,
    }
    
    const TenantModelScheme = {
      id: types.identifier(),
      name: types.string,
      creationDate: types.Date,
      address1: nullableStringType,
      address2: nullableStringType,
      address3: nullableStringType,
      zip: nullableStringType,
      country: nullableStringType,
      technicalContact: types.maybe(types.model(TenantContactModelSceheme)),
      minPasswordLength: types.number,
      canUserSignup: types.boolean,
      mfaEnabled: types.boolean,
      apiKeys: types.array(types.maybe(types.model(APIKeyModelScheme))),
      autoVerifiedAttributes: types.array(types.string),
      passwordPolicy: types.array(nullableStringType),
      premiumFeatures: types.array(nullableStringType),
    }
    
    const TenantModel = types.model('TenantModel', TenantModelScheme).actions(self => ({
      applyChanges(changes) {
        Object.assign(self, changes)
      },
    
      save: flow(function* () {
        const tenantSnapshot = getSnapshot(self)
        yield tenantService.update(tenantSnapshot.id, tenantSnapshot)
        return self
      }),
    })).views(self => ({
      get allKeys() {
        /* @feature billing:off:inl_replace:/return self.developmentKeys/ */
        return self.apiKeys
      },
    
      get developmentKeys() {
        return fp.filter({ free: true, active: true }, self.apiKeys)
      },
    
      get commercialKeys() {
        /* @feature billing:off:inl_replace:/return []/ */
        return fp.reject('free', self.apiKeys)
      },
    }))
    
    export default TenantModel
    `
  , {
    features: {
      billing: false,
    }
  })
)