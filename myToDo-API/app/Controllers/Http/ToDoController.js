'use strict'

const Config = use('Config')
const Database = use('Database')

const TodoRepository = use('App/Repositories/Todo')
const NoteRepository = use('App/Repositories/Note')
const ResourceController = use('App/Controllers/Http/ResourceController')

const {abort, httpCodes, messages, arrayColumn} = use('App/Helper')


class ToDoController extends ResourceController {
  constructor() {
        const todoRepo = new TodoRepository()
        const noteRepo = new NoteRepository()
        super(todoRepo)

        this.todoRepo = todoRepo
        this.noteRepo = noteRepo
    }
    /**
     * get single todo infor
     * includes note
     */
    async index({request, response, params}) {
        // get target todo
        let targetTodoId
        if (params.id)
            targetTodoId = params.id

        // check and abort
        if (!targetTodoId)
            abort(httpCodes.badRequest)

        // get todo with relationship
        let targetTodo
        try {   
            targetTodo = await this.todoRepo.getSingle(targetTodoId)
        } catch (e) {
            abort(httpCodes.internalError)
        }

        // check target and abort request
        // target todo is not found
        if (!targetTodo)
            abort(httpCodes.notFound)

        return response.dataJSON(targetTodo)
    }
    /**
     * 1. create a new note
     */
    async store({request, response,params, auth}) {
        // rules: Validators/Note/Store
        let targetTodoId
        if (params.id)
            targetTodoId = params.id

        const inputNoteAttr = request.all()
        
        //const curUser = auth.user
        inputNoteAttr.todo_id = parseInt(targetTodoId)
        
        // create new todo
        const newNote = await this.noteRepo.store(inputNoteAttr)
        return newNote
        console.log(newNote);
        if (!newNote)
            abort(httpCodes.internalError)

        return response.dataJSON(newNote)
    }
    /**
     * delete note
     */
    async deleteNote({request, response, params, auth}) {
        // get target todo
        const targetNote = await this.noteRepo.findOneOrFailed(params.id)

        // check and abort request
        const targetUser = auth.user
        
        if (!targetNote) // delete other one todo
            abort(httpCodes.notFound)
        // delete
        await this.noteRepo.delete(params.id)

        return response.dataJSON()
    }

    /**
     * update todo status
     */
    async updateTodo({request, response, params}) {
        // rules: Validators/Todos/UpdateStatus
        const targetTodo = await this.todoRepo.findOneOrFailed(params.id)

        if (parseInt(request.input('completed'), 10) === targetTodo.completed)
        abort(httpCodes.badRequest)

        // update status
        const res = await this.todoRepo.update(targetTodo, {
            completed: request.input('completed')
        })

        return response.dataJSON(res)
    }

    /**
     * update note
     */
    async update({request, response, params}) {
        // rules: Validators/Note/Update
        const inputAttr = request.all()

        // target node
        const targetNote = await this.noteRepo.findOneOrFailed(params.id)

        // update
        await this.noteRepo.update(targetNote, inputAttr, null, true)

        return response.dataJSON(targetNote)
    }
}

module.exports = ToDoController
