'use strict'

const {messages} = use('App/Helper')

class Base {
  get validateAll() {
    return true
  }

  get messages() {
    return {
      'username.required': messages.usernameRequired,
      'username.min': messages.usernameMin,
      'email.required': messages.emailRequired,
      'email.unique': messages.emailUnique,
      'email.email': messages.emailEmail,
      'password.required': messages.passwordRequired,
      'password.min': messages.passwordMin,
      'password.confirmed': messages.passwordConfirmed,
      'refresh_token.required': messages.refreshTokenRequired,
      'verification_code.required': messages.verificationCodeRequired,
      'token.required': messages.tokenRequired,
      'current_password.required': messages.currentPasswordRequired,
      'new_password.required': messages.newPasswordRequired,
      'confirm_new_password.required': messages.newPasswordConfimRequired
    }
  }

  async fails(errorMessages) {
    // process errorMessages
    const output = {}
    errorMessages.forEach(element => {
      output[element.field] = element
    })
    return this.ctx.response.errorJSON(output)
  }
}

module.exports = Base
