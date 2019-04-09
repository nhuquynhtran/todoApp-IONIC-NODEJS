'use strict'

const BaseValidator = use('App/Validators/Base')

class ResetPassword extends BaseValidator {
  get rules() {
    return {
      verification_code: 'required|string',
      password: 'required|string|confirmed'
    }
  }
}

module.exports = ResetPassword
