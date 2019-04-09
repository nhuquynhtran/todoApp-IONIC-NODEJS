'use strict'

const BaseValidator = use('App/Validators/Base')

class ForgotPassword extends BaseValidator {
  get rules() {
    return {
      email: 'required|email'
    }
  }
}

module.exports = ForgotPassword
