'use strict'

const Config = use('Config')
const BaseValidator = use('App/Validators/Base')
const {rule} = use('indicative')

class UpdateStatus extends BaseValidator {
  get rules() {
    return {
      completed: [
        rule('in', Object.values(Config.get('todo.statuses')))
      ],
    }
  }
}

module.exports = UpdateStatus
