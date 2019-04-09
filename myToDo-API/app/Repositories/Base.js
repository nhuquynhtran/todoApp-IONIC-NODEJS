'use strict'

const _ = use('underscore')

const {abort, httpCodes, messages} = use('App/Helper')

class Base {
  constructor(model) {
    this.model = model
  }

  /**
   * find one record by criteria
   * @param criteria integer|object|array
   * @param withRelationships string|array|object
   * @param order array|string
   */
  async findOne(criteria = {}, withRelationships = null, order = ['id', 'asc']) {
    // build query
    const builder = this.preQueryHelper(criteria, withRelationships, order)

    // execute query
    let result
    try {
      result = await builder.first()
    } catch (e) {
      // throw HttpException
      abort(httpCodes.badRequest)
    }

    return result
  }

  /**
   * find one record by criteria
   * @param criteria integer|object|array
   * @param withRelationships string|array|object
   * @param order array|string
   */
  async findOneOrFailed(criteria = {}, withRelationships = null, order = ['id', 'asc']) {
    // build query
    const builder = this.preQueryHelper(criteria, withRelationships, order)

    // execute query
    let result
    try {
      result = await builder.first()
    } catch (e) {
      // throw HttpException
      abort(httpCodes.badRequest)
    }

    // check and abort
    if (!result)
      abort(httpCodes.notFound, `No ${this.model.prettyName} was found for your request`)

    return result
  }

  /**
   * find all record by criteria
   * @param criteria object|array
   * @param withRelationships string|array|object
   * @param order array|string
   */
  async findAll(criteria = {}, withRelationships = null, order = ['id', 'asc']) {
    // build query
    const builder = this.preQueryHelper(criteria, withRelationships, order)

    // execute query
    let results
    try {
      results = await builder.fetch()
    } catch (e) {
      // throw HttpException
      abort(httpCodes.badRequest)
    }

    return results
  }

  /**
   * pagination
   * @param criteria object|array
   * @param page integer
   * @param perPage integer
   * @param withRelationships string|array|object
   * @param order array|string
   */
  async paginate(criteria = {}, page = 1, perPage = 20, withRelationships = null, order = ['id', 'asc']) {
    // build query
    const builder = this.preQueryHelper(criteria, withRelationships, order)

    // execute query
    let result
    try {
      result = await builder.paginate(page, perPage)
    } catch (e) {
      // throw HttpException
      abort(httpCodes.badRequest)
    }

    return result
  }

  /**
   * create a new record
   * @param attributes object
   */
  async store(attributes = {}) {
    const modelInstance = new this.model()
    const fields = this.model.fillable

    // fill data to fillable fields
    _.each(fields, field => {
      if (attributes.hasOwnProperty(field)) {
        modelInstance[field] = attributes[field]
      }
    })

    // create new record
    let result
    result = await modelInstance.save()
    try {
      //result = await modelInstance.save()
    } catch (e) {
      //abort(httpCodes.internalError)
    }

    if (result)
      return modelInstance

    return result
  }

  /**
   * update a record
   * @param i Base|integer
   * @param attributes object
   * @param inputTrusted boolean
   */
  async update(i, attributes = {}, inputTrusted = true) {
    // check/get target
    const modelInstance = (i instanceof this.model)
      ? i
      : await this.model.find(i)

    // check and abort
    if (!modelInstance) {
      abort(httpCodes.badRequest, `No ${this.model.prettyName} was found for your request`)
    }
    // check "unique" fields if they are being changed
    const uniqueFields = this.model.uniqueFields
    const checkedFields = []
    const errors = {}
    let hasError = false
    let tempQuery = this.model.query().whereNot('id', modelInstance.id)
    let checkResult
    let tempCriteriaCount = 0

    _.each(uniqueFields, field => {
      if (attributes.hasOwnProperty(field)) {
        if (modelInstance[field] !== attributes[field]) {
          tempCriteriaCount++
          const tempCriteria = {}
          tempCriteria[field] = attributes[field]
          if (tempCriteriaCount === 1)
            tempQuery = tempQuery.where(tempCriteria)
          else
            tempQuery = tempQuery.orWhere(tempCriteria)
          checkedFields.push(field)
        }
      }
    })

    if (checkedFields.length) {
      checkResult = await tempQuery.first()

      // prepare errors
      if (checkResult) {
        hasError = true
        checkResult = checkResult.toJSON()
        await _.each(checkedFields, field => {
          if (checkResult[field] === attributes[field]) {
            errors[field] = {
              message: `The ${this.model.prettyName} ${this.model.niceColumnNames[field] ? this.model.niceColumnNames[field] : field} is taken`
            }
          }
        })
      }
    }

    if (hasError) {
      abort(httpCodes.badRequest, errors)
    } else {
      // fill data to fillable fields
      // except fields that guarded
      let updateableFields = this.model.updateableFieldsViaInput
      if (!updateableFields || inputTrusted)
        updateableFields = this.model.fillable
      const guardedFields = modelInstance.guarded
      _.each(updateableFields, field => {
        if (!_.contains(guardedFields, field)) {
          if (attributes.hasOwnProperty(field)) {
            modelInstance[field] = attributes[field]
          }
        }
      })
    }

    await modelInstance.save()

    return modelInstance
  }

  /**
   * update many records (return number of effected records)
   * @param criteria object|array|integer
   * @param attributes object
   * @param inputTrusted boolean
   */
  async bulkUpdates(criteria, attributes = {}, inputTrusted = false) {
    // perpare query
    const builder = this.preQueryHelper(criteria)

    const tobeUpdatedAttr = {}

    // fill data
    // except guarded fields
    let updateableFields = this.model.updateableFieldsViaInput
    if (!updateableFields || inputTrusted)
      updateableFields = this.model.fillable
    const guardedFields = this.model.guarded
    _.each(updateableFields, field => {
      if (!_.contains(guardedFields, field)) {
        if (attributes.hasOwnProperty(field)) {
          tobeUpdatedAttr[field] = attributes[field]
        }
      }
    })

    // bulk update
    const result = await builder.update(tobeUpdatedAttr)

    return result
  }

  /**
   * @param i Base|integer
   */
  async delete(i) {
    // check/get target
    const modelInstance = (i instanceof this.model)
      ? i
      : await this.model.find(i)

    // check and abort
    if (!modelInstance)
      abort(httpCodes.badRequest, `No ${this.model.prettyName} was found for your request`)

    // delete
    let result
    try {
      result = await modelInstance.delete()
    } catch (e) {
      let message = messages.deleteFailed
      const msgKey = `delete${this.model.name}Failed`
      if (messages.hasOwnProperty(msgKey) && messages[msgKey])
        message = messages[msgKey]
      // throw HttpException
      abort(httpCodes.badRequest, message)
    }

    return result
  }

  /**
   * delete many records
   * @param criteria object|array|integer
   */
  async bulkDeletes(criteria = {}) {
    // prepare query
    const builder = this.preQueryHelper(criteria)

    // delete
    const result = await builder.delete()

    return result
  }

  /**
   * query builder process before query
   * @param criteria integer|object|array
   * @param withRelationships string|array|object
   * @param order array|string
   */
  preQueryHelper(criteria = {}, withRelationships = null, order = ['id', 'asc']) {
    let builder = this.model.query()

    // process criteria
    if (_.isString(criteria) || _.isNumber(criteria)) {
      // query by id
      const id = parseInt(criteria, 10)
      if (Number.isNaN(id))
        abort(httpCodes.badRequest, `You've requested an invalid ${this.model.prettyName}`)
      else
        builder = builder.where({id})
    } else if (_.isArray(criteria)) {
      // query by array of criteria objects
      for (let i = 0; i < criteria.length; i++) {
        builder = builder.where(criteria[i])
      }
    } else if (criteria.field && _.isString(criteria.field)
      && criteria.whereIn && _.isArray(criteria.whereIn)) {
      builder = builder.whereIn(criteria.field, criteria.whereIn)
    } else {
      builder = builder.where(criteria)
    }

    // add relationship
    if (withRelationships) {
      let rels = []

      if (!_.isArray(withRelationships))
        rels.push(withRelationships)
      else
        rels = withRelationships

      _.each(rels, rel => {
        if (_.isObject(rel))
          builder = builder.with(rel.name, rel.query)
        else
          builder = builder.with(rel)
      })
    }

    // add order by
    if (order) {
      if (_.isArray(order))
        builder = builder.orderBy(order[0], order[1])
      else if (_.isString(order))
        builder = builder.orderByRaw(order)
    }

    return builder
  }
}

module.exports = Base
