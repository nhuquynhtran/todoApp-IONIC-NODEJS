'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Config = use('Config')

class UsersSchema extends Schema {
  up () {
    this.create('users', table => {
      table.increments()
      table.timestamps()
      table.string('fullname', 255).notNullable()
      table.string('username', 100).notNullable()
      table.string('email', 254).notNullable().unique()
      table.integer('status').notNullable().defaultTo(Config.get('user.statuses.active'))
      table.string('password', 60).notNullable()
      table.string('verification_code', 6).nullable()
      table.timestamp('verification_code_expires').nullable()
    })
    // make a default admin and super admin
    // default password is: Abc@1234
    this.raw(`
    INSERT INTO users (created_at, updated_at, fullname, username, email, password) VALUES
    (NOW(), NOW(), 'BFast', 'BFast', 'nhuquynhtran.mdc@gmail.com', '$2a$10$W7G3JKWBXXtD0okPr5VqPe2R4/nFTfat1/IVM1RE6EDzSIZSQKiQ6')
    `)
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
