'use strict'

const Config = use('Config')
const Database = use('Database')

const TodoModel = use('App/Models/Todo')
const NoteModel = use('App/Models/Note')
const UserModel = use('App/Models/User')
const BaseRepository = use('App/Repositories/Base')

const {abort, arrayColumn} = use('App/Helper')

class Todo extends BaseRepository {
  constructor() {
    super(TodoModel)
    this.todo = TodoModel
    this.note = NoteModel
    this.user = UserModel
  }

  /**
   * get single todo infor by id
   */
  async getSingle(id) {
    //const id = !Number.isNaN(parseInt(id, 10))
    let targetTodo = this.todo.query().select('todos.*')
    targetTodo = targetTodo.where('todos.id', id)
    targetTodo = targetTodo.with('notes', notesQuery => {
        notesQuery
          .select('id as note_id', 'description', 'status', 'todo_id')
          .orderByRaw('notes.id desc')
      })
      targetTodo = targetTodo.first()
    return targetTodo
  }

  /**
   * filter todos then paginate
   */
  async getTodosData(currentLoggedInUser = null, page = 1, perPage = 20) {

    let builder = this.todo.query().select('todos.*')
        builder = builder.where('todos.user_id', currentLoggedInUser.id)

    builder = builder.with('notes', notesQuery => {
      notesQuery
        .select('id as note_id', 'description', 'status', 'todo_id')
    })
    // order by
    let order = 'todos.id desc'
    builder = builder.orderByRaw(order)

    // unique todo information in results
    builder = builder.groupByRaw('todos.id')

    // custom pagination
    const offset = parseInt((page - 1) * perPage, 10)
    const total = parseInt(await builder.getCount(), 10)
    const lastPage = Math.ceil(parseInt(total, 10) / parseInt(perPage, 10))

    let todos = await builder.offset(offset).limit(perPage).fetch()

    let total_completed = this.todo.query().select('todos.*')
    total_completed = total_completed.where('todos.user_id', currentLoggedInUser.id)
    total_completed = total_completed.where('todos.completed', Config.get('todo.statuses.completed'))
    let completed = await total_completed.getCount()

    todos = todos.toJSON()

    // final result
    // pageginated
    return {
      total,
      perPage,
      page,
      lastPage,
      data: todos,
      total_completed: completed
    }
  }

  /**
   * delete todo
   */
  async deleteTodo(currentTodo) {
    const targetTodo = this.todo.query()
    targetTodo = targetTodo.where('todos.id', currentTodo.id).delete()
    const affectedRows = await Database
    .table('users')
    .where('username', 'tutlage')
    .delete()
  }
}

module.exports = Todo
