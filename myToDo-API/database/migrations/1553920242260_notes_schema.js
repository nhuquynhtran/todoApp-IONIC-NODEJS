'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Config = use('Config')

class NotesSchema extends Schema {
  up () {
    this.create('notes', table => {
      table.increments()
      table.timestamps()
      table.string('description', 3000).notNullable()
      table.integer('todo_id').notNullable().unsigned().references('id').inTable('todos')
      table.integer('status').notNullable().defaultTo(Config.get('note.statuses.active'))
    })

  }

  down () {
    this.drop('notes')
  }
}

module.exports = NotesSchema
