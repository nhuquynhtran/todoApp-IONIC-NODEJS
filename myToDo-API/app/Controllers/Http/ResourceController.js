'use strict'

const TodoRepository = use('App/Repositories/Todo')
const NoteRepository = use('App/Repositories/Note')

const {abort, httpCodes, messages} = use('App/Helper')

class ResourceController {
  constructor(repo) {
    this.repo = repo
    this.todoPepo = new TodoRepository()
    this.noteRepo = new NoteRepository()
  }

  /**
   * get all records (DO NOT use with table with huge records)
   */
  async listAll({response}) {
    const results = await this.repo.findAll()

    return response.dataJSON(results)
  }

  /**
   * paginate default
   */
  async list({request, response}) {
    const {page, perPage} = request.currentPage()

    // filter result
    const results = await this.repo.paginate({}, page, perPage, null, ['id', 'desc'])

    return response.dataJSON(results)
  }

  /**
   * get single record by id
   */
  async index({response, params}) {
    const targetResource = await this.repo.findOneOrFailed(params.id)

    return response.dataJSON(targetResource)
  }

  /**
   * create new record
   */
  async store({request, response}) {
    const inputAttr = request.all()

    const newResource = await this.repo.store(inputAttr)

    if (!newResource)
      abort(httpCodes.internalError)

    return response.dataJSON(newResource, httpCodes.created)
  }

  /**
   * update record
   */
  async update({request, response, params}) {
    const inputAttr = request.all()

    // save new attributes
    const targetResource = await this.repo.update(params.id, inputAttr)

    return response.dataJSON(targetResource)
  }

  /**
   * delete record
   */
  async delete({response, params}) {
    const result = await this.repo.delete(params.id)

    if (!result) // no resource is deleted
      abort(httpCodes.badRequest)

    return response.dataJSON()
  }
}

module.exports = ResourceController
