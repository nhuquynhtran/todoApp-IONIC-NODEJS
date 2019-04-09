'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Config = use('Config')

class TodosSchema extends Schema {
  up () {
    this.create('todos', table => {
      table.increments()
      table.timestamps()
      table.string('title', 255).notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users')
      table.integer('completed').notNullable().defaultTo(Config.get('todo.statuses.processing'))
    })
  }

  down () {
    this.drop('todos')
  }
}

module.exports = TodosSchema
