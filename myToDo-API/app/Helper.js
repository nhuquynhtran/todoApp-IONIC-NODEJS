'use strict'

const HttpException = use('App/Exceptions/HttpException')

class Helper {
  /*
   * abort request
   */
  static abort(httpCode, message = 'error', objectCode = 'message') {
    let msgObj = {}
    // default messages
    if (message === 'error') {
      switch (httpCode) {
        case 400:
          message = 'Bad Request'
          break
        case 401:
          message = 'Unauthorized'
          break
        case 403:
          message = 'Forbidden'
          break
        case 404:
          message = 'Not Found'
          break
        case 405:
          message = 'Method is not allowed'
          break
        case 500:
          message = 'Something went wrong, please try again later'
          break
      }
    }
    if (message && typeof message === 'object') {
      msgObj = message
    } else if (objectCode !== 'message') {
      msgObj[objectCode] = {message}
    } else {
      msgObj = {message}
    }

    // abort
    throw new HttpException(msgObj, httpCode)
  }

  /**
   * popular http response code
   */
  static get httpCodes() {
    return {
      OK: 200,
      created: 201,
      badRequest: 400,
      unauthorized: 401,
      forbidden: 403,
      notFound: 404,
      methodNotAllowed: 405,
      unprocessableEntity: 422,
      internalError: 500
    }
  }

  /**
   * API response error/status messages
   */
  static get messages() {
    return {
      badRequest: 'Bad Request',

      // api messages
      notFound: 'Target resource is not found',
      deleteFailed: 'Failed on deleting target resource, it\'s normally caused by other-related resources that are depended on it',
      userIsNotFound: 'No account was found with the details',
      invalidPassword: 'Invalid password',
      invalidVerificationCode: 'Invalid verification code',
      verificationCodeExpired: 'Verification code has expired',
      forgotPasswordTokenExpired: 'The token is expired',
      loginRequired: 'You have to login to perform this action',
      currentlyLoggedIn: 'You are currently logged in',
      // validation messages
      // required
      requiredDefaultMsg: 'The field is required',
      emailRequired: 'Valid email address is required',
      passwordRequired: 'Password is required',
      refreshTokenRequired: 'Refresh token is required',
      verificationCodeRequired: 'Verification code is required',
      tokenRequired: 'Token is required',
      currentPasswordRequired: 'Your current password is required.',
      invalidCurrentPassword: 'Invalid password',
      newPasswordRequired: 'This field is required',
      newPasswordConfimRequired: 'This field is required',

      // unique
      emailUnique: 'The email address is taken',
      emailUniqueWhenRegister: 'Someone used this email address to register. To continue with the email, you have to login using the email first.',

      // email type
      emailEmail: 'Valid email address is required',
      tempNewEmailEmail: 'Valid email address is required',

      // min/max
      passwordMin: 'Password must be at least 8 characters',

      // confirmation
      passwordConfirmed: 'The password does not match',
    }
  }

  /**
   * custom array column
   */
  static arrayColumn(arr, column) {
    const result = []
    arr.forEach(data => {
      if (data.hasOwnProperty(column))
        result.push(data[column])
    })
    return result
  }

  /**
   * verifiation code generator helper
   */
  static verificationCodeGenerator() {
    return Math.floor(100000 + Math.random() * 900000)
  }
}

module.exports = Helper
