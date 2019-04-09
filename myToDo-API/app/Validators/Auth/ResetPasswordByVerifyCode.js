'use strict'

const BaseValidator = use('App/Validators/Base')

class ResetPassword extends BaseValidator {
  get rules() {
    return {
      verification_code: 'required|string',
      new_password: 'required|string',
      confirm_new_password: 'required|string'
    }
  }
}

module.exports = ResetPassword
