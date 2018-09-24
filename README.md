# Plugin that hepls to add/remove/replace code based on included features

__How to install:__
- `yarn install brunch-feature-switcher`
- `npm i brunch-feature-switcher`

---
## __Get Started:__

__Example:__
```javascript
// #brunch-config.js
module.exports = {
  plugins: {
    featureSwitcher: {
      features: {
        // set feature on
        billing: false,
        // Retrieve from env vars
        stat: process.env.FEATURE_STAT === 'true',
      },
    },
  },
}

// #some.code.js

/* @feature billing:off:remove */
import billingUtils from './billingUtils'
import someOtherStuff from './someOtherStuff'

/* @feature billing:off:remove */
const BILLING_IS_OK = 'status_billing_is_ok'

/* @feature billing:on:remove */
const billingFaker = () => { /* ... */ };

class Checker {
  constructor(...) {
    ...somecode
  }

  get billingKeys() {
    /* @feature billing:off:inl_replace:/return []/ */
    return self.keys.filter(({ billing }) => billing)
  }

  get devKeys() {
    return self.keys.filter(({ dev }) => dev)
  }

  get allKeys() {
    return [...this.devKeys, ...this.billingKeys]
  }
}

```

It produces the following code after `brunch build` if billing feature is __off__


__Example: Result after build__
```javascript
import someOtherStuff from './someOtherStuff'

const billingFaker = () => { /* ... */ };

class Checker {
  constructor(...) {
    ...somecode
  }

  get billingKeys() {
    return []
  }

  get devKeys() {
    return self.keys.filter(({ dev }) => dev)
  }

  get allKeys() {
    return [...this.devKeys, ...this.billingKeys]
  }
}
```

It produces the following code after `brunch build` if billing feature is __on__.

```javascript
import billingUtils from './billingUtils'
import someOtherStuff from './someOtherStuff'

const BILLING_IS_OK = 'status_billing_is_ok'

class Checker {
  constructor(...) {
    ...somecode
  }

  get billingKeys() {
    return self.keys.filter(({ billing }) => billing)
  }

  get devKeys() {
    return self.keys.filter(({ dev }) => dev)
  }

  get allKeys() {
    return [...this.devKeys, ...this.billingKeys]
  }
}

```

---

## __Short explanation:__

This plugin adds some sort of pre-build directives that help you to remove code blocks/expressions/ and other code stuff based on state of features.

To mark blocks/exprs/other for handling you should use a comment with defined format:
- `/* @feature _name_:_state_:_applied_action_:_args_ */`
- `// @feature _name_:_state_:_applied_action_:_args_`

Example:
```javascript

const dropdownItems = [
  /* @feature billing:off:remove */
  {
    title: 'Hello',
  },
  /* @feature billing:on:remove */
  {
    title: 'World',
  }
]

/* @feature billing:off:inl_replace:/throw new Error('error')/ */
const a = [1]
```

You can read this pre-build directive as:
- ___if billing feature is off, then remove `{title: 'Hello'}`___
- ___if billing feature is on, then remove `{title: 'World'}`___
- ___if billing feature is off, then replace `const a = [1]` with `throw new Error('error')`___

---

## __Multiple features in directive:__

You can list more than one features in directive thru commas or spaces,
if code existence depends on more than one condition:

```javascript

const dropdownItems = [
  /* @feature billing:off:remove, stat:off:remove */
  {
    title: 'Hello',
  },
  /* @feature billing:on:remove, stat:on:remove */
  {
    title: 'World',
  }
]

/* @feature billing:off:inl_replace:/throw new Error('error')/ */
const a = [1]
```

NB!: If you set a few features in row it will work as logical __and__, also be careful: if one of the actions should replace something it should be listed as last:
```javascript
/* @feature n1:off:remove, n2:off:inl_replace:/[1, 2, 3]/ */
```


NB!: If pay your attention to inl_replace action you will see that arg is surrouneded by `/`, it made on purpose of escaping. (cuz spaces and commas tells parser to handle new feature, but we want to avoid that in case of args)

---

## __Important !__

You should move `brunch-feature-switcher` up in package.json (to make it stand before all other code transformation (es6 to es5 transformation for instance))


![Packages order](https://github.com/Shalimov/brunch-feature-switcher/blob/master/packages-cheat.png "Order of packs")


---
__TODO:__
- Going to add complex replacment procedure
- Add block directives, such as:
  ```
  /* @feature:begin name:state:action:args */
  ...some code...
  /* @feature:end */
  ```
- Add docs and more examples
