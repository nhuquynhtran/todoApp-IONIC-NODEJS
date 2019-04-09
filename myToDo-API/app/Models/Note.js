'use strict'

const Base = use('App/Models/Base')

class Note extends Base {
  static boot() {
    super.boot()
  }

  /**
   * define table name
   */
  static get table() {
    return 'notes'
  }

  static get prettyName() {
    return 'note'
  }

  /**
   * data fillable fields
   */
  static get fillable() {
    return [
      'description',
      'status',
      'todo_id'
    ]
  }

  /**
   * hidden fields
   */
  static get hidden() {
    return [
      //
    ]
  }

  /**
   * guarded fields
   * these fields can not be changed value
   */
  get guarded() {
    return [
      //
    ]
  }

  /**
   * todos
   */
  todos() {
    return this.belongsTo('App/Models/Todo', 'todo_id', 'id')
  } 
  
}

module.exports = Note
