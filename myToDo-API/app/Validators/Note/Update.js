'use strict'

const BaseValidator = use('App/Validators/Base')

class Update extends BaseValidator {
  get rules() {
    return {
      description: 'string|min:1'
    }
  }
}

module.exports = Update
