'use strict'

const Config = use('Config')
const Database = use('Database')

const TodoModel = use('App/Models/Todo')
const NoteModel = use('App/Models/Note')
const UserModel = use('App/Models/User')
const BaseRepository = use('App/Repositories/Base')

class Note extends BaseRepository {
  constructor() {
    super(NoteModel)
    this.note = NoteModel
    this.todo = TodoModel
  }
}


module.exports = Note
