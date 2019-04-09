'use strict'

const BaseValidator = use('App/Validators/Base')
const {messages} = use('App/Helper')

// TODO
class UpdateInfo extends BaseValidator {
  get rules() {
    return {
      title: 'string|min:6',
    }
  }
}

module.exports = UpdateInfo
