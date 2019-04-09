'use strict'

const BaseValidator = use('App/Validators/Base')

class Store extends BaseValidator {
  get rules() {
    return {
      description: 'required|string',
    }
  }
}

module.exports = Store
