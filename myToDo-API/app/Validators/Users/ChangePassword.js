'use strict'

const BaseValidator = use('App/Validators/Base')

class ChangePassword extends BaseValidator {
  get rules() {
    return {
      current_password: 'required|string',
      new_password: 'required|string|min:6',
      confirm_new_password: 'required|string|min:6'
    }
  }
}

module.exports = ChangePassword
