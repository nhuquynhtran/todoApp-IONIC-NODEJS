'use strict'

const Model = use('Model')
const _ = use('underscore')

class Base extends Model {
  // static boot() {
  //   super.boot()
  // }

  // https://github.com/adonisjs/adonis-lucid/issues/274
  static _bootIfNotBooted() {
    if (this.name !== 'Base') {
      super._bootIfNotBooted()
    }
  }

  static get updateableFieldsViaInput() {
    return null
  }

  /**
   * default pretty name
   */
  static get prettyName() {
    return this.name
  }

  /**
   * db unique fields
   */
  static get uniqueFields() {
    return []
  }

  /**
   * cast all fields
   * include hidden fields
   * only use when we need hidden properties
   * (never use this method to output resource instance)
   */
  allProperties() {
    let result
    try {
      result = this.toJSON()
    } catch (e) {
      return null
    }

    const hiddenFields = this.$hidden
    if (hiddenFields) {
      _.each(hiddenFields, field => {
        result[field] = this[field]
      })
    }

    return result
  }
}

module.exports = Base
