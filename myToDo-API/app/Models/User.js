'use strict'

const Hash = use('Hash')
const Config = use('Config')

const Base = use('App/Models/Base')

class User extends Base {
  static boot() {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    super.addHook('beforeSave', async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * define table name
   */
  static get table() {
    return 'users'
  }

  static get prettyName() {
    return 'user'
  }

  /**
   * data fillable fields
   */
  static get fillable() {
    return [
      'fullname',
      'email',
      'password',
      'status',
      'verification_code',
      'verification_code_expires'
    ]
  }

  static get updateableFieldsViaInput() {
    return [
      'fullname',
      'password'
    ]
  }

  /**
   * hidden fields
   */
  static get hidden() {
    return [
      'password',
      'verification_code',
      'verification_code_expires'
    ]
  }

  /**
   * guarded fields
   * these fields can not be changed value
   */
  get guarded() {
    return [
      'email'
    ]
  }

  /**
   * db unique fields
   */
  static get uniqueFields() {
    return [
      'email'
    ]
  }

  /**
   * custom function
   * can not use isDeleted() <- Lucid Model ???
   */
  isAccountDeleted() {
    return (this && this.status === Config.get('user.statuses.deleted'))
  }

  /**
   * custom function
   * check if user is in active status
   */
  isAccountActive() {
    return (this && this.status === Config.get('user.statuses.active'))
  }
  
  /**
   * tokens
   */
  tokens() {
    return this.hasMany('App/Models/Token', 'id', 'user_id')
  }
  /**
   * todos
   */
  todos() {
    return this.hasMany('App/Models/Todo', 'id', 'user_id')
  }
}

module.exports = User
