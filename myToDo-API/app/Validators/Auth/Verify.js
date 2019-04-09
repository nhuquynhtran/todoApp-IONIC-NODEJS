'use strict'

const BaseValidator = use('App/Validators/Base')

class Verify extends BaseValidator {
  get rules() {
    return {
      verification_code: 'required|string'
    }
  }
}

module.exports = Verify
