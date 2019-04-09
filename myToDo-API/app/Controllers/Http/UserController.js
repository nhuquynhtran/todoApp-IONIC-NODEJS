'use strict'
const Config = use('Config')

const UserRepository = use('App/Repositories/User')
const TodoRepository = use('App/Repositories/Todo')
const NoteRepository = use('App/Repositories/Note')
const {abort, httpCodes, messages} = use('App/Helper')

class UserController {
    constructor() {
        this.userRepo = new UserRepository()
        this.todoRepo = new TodoRepository()
        this.noteRepo = new NoteRepository()
    }

    /**
     * update user
     */
    async update({request, response, params}) {
        // rules: Validators/Users/Update
        const inputAttr = request.all()

        // get target user
        let targetUser
        targetUser = request.user 

        // check and abort
        if (!targetUser)
        abort(httpCodes.badRequest)

        if (targetUser.isAccountDeleted()) // when admin query
        abort(httpCodes.notFound)
        // update
        targetUser = await this.userRepo.update(targetUser, inputAttr, null, inputTrusted)

        return response.dataJSON(targetUser)
    }
    /**
     * update password
     */
    async changePassword({request, response, auth}) {
        // rules: Validators/Users/ChangePassword
        if (request.input('new_password') !== request.input('confirm_new_password'))
            abort(httpCodes.badRequest, messages.passwordConfirmed, 'confirm_new_password')

        // check current password
        const curUser = auth.user
        console.log(curUser);
        try {
            await auth.attempt(
                curUser.email,
                request.input('current_password')
                )
        } catch (e) {
            abort(httpCodes.badRequest, messages.invalidCurrentPassword, 'current_password')
        }

        const res = await this.userRepo.update(curUser, {
            password: request.input('new_password')
        }, null, true)

        return response.dataJSON(res)
    }
    /**
     * list tasks
     */
    async listTasks({request, response, auth}) {
        const curUser = auth.user
        const output = await this.todoRepo.getTodosData(curUser)

        return response.dataJSON(output)
    }

    /**
     * 1. create a new todo
     */
    async store({request, response, auth}) {
        // rules: Validators/Todo/Store
        const inputAttr = request.all()
        const curUser = auth.user

        inputAttr.user_id = curUser.id
        // create new todo
        let newTodo = await this.todoRepo.store(inputAttr)

        if (!newTodo)
            abort(httpCodes.internalError)

        return response.dataJSON(newTodo)
    }

    /**
     * delete todo
     */
    async deleteTodo({request, response, params, auth}) {
        // get target todo
        const targetTodo = await this.todoRepo.findOneOrFailed(params.id)

        // check and abort request
        const targetUser = auth.user
        if (targetTodo.user_id !== targetUser.id) // delete other one todo
            abort(httpCodes.notFound)
        await this.noteRepo.bulkDeletes({todo_id : params.id})
        // delete
        await this.todoRepo.delete(targetTodo)

        return response.dataJSON()
    }
}

module.exports = UserController
