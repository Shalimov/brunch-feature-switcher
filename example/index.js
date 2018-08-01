const resolver = require('../code-resolver')

console.log(
  resolver(
    `
    import abc from './abc'
    /* @feature billing:on:remove */
    import abc1 from './abc'
    /* @feature billing:off:remove */
    import abc2 from './abc'


    /* @feature billing:off:inl_replace:{const d = [1, 2, 3]} */
    const ab = [1, 2, 3]

    /* @feature billing:off:inl_replace:{const d = []} */
    const ab = [1, 2, 3]

    /* @feature billing:off:remove */
    const ab = [4, 5, 6]   
    `
  , {
    features: {
      billing: false,
    }
  })
)