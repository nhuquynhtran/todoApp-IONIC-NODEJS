'use strict'

const BaseValidator = use('App/Validators/Base')

class RefreshToken extends BaseValidator {
  get rules() {
    return {
      refresh_token: 'required|string'
    }
  }
}

module.exports = RefreshToken
