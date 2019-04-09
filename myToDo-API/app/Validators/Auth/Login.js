'use strict'

const BaseValidator = use('App/Validators/Base')

class Login extends BaseValidator {
  get rules() {
    return {
      email: 'required|email',
      password: 'required|string'
    }
  }
}

module.exports = Login
