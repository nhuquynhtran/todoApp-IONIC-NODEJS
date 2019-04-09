'use strict'

const Config = use('Config')
const Base = use('App/Models/Base')

class Todo extends Base {
  static boot() {
    super.boot()
  }

  /**
   * define table name
   */
  static get table() {
    return 'todos'
  }

  static get prettyName() {
    return 'todo'
  }

  /**
   * data fillable fields
   */
  static get fillable() {
    return [
      'title',
      'user_id',
      'completed'
    ]
  }

  static get updateableFieldsViaInput() {
    return [
      'title',
      'completed'
    ]
  }

  /**
   * guarded fields
   * these fields can not be changed value
   */
  get guarded() {
    return [
      'user_id'
    ]
  }

  /**
   * notes
   */
  notes() {
    return this.hasMany('App/Models/Note', 'id', 'todo_id')
  }
  
  /**
   * user
   */
  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Todo
