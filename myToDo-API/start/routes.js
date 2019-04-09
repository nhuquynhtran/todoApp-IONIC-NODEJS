'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('Welcome to My Todo app')
/**
 * AUTHORISATION
 */
Route
  .group(() => {
    Route.post('/register', 'AuthController.register')

    Route
      .post('/login', 'AuthController.login')
      .validator('Auth/Login')

    Route
      .post('verification/send', 'AuthController.ResetPasswordByVerifyCode')
      .middleware('auth')
      .validator('Auth/ResetPasswordByVerifyCode')

    Route
      .post('verification/check', 'AuthController.verify')
      .middleware('auth')
      .validator('Auth/Verify')

    Route
      .post('verification/get', 'AuthController.getVerificationCodeResetPassword')
      .validator('Auth/ForgotPassword')

    Route
      .post('password/reset', 'AuthController.resetPassword')
      .validator('Auth/ResetPassword')
  })
  .prefix('auth')

  /**
 * USERS
 */
Route
.group(() => {
  Route
    .patch('me', 'UserController.update')
    .middleware('auth')
    .validator('Users/Update')

  Route
    .patch('change-password', 'UserController.changePassword')
    .middleware('auth')
    .validator('Users/ChangePassword')

  Route
    .get('get-list-tasks', 'UserController.listTasks')
    .middleware('auth')

  Route
    .post('add-task', 'UserController.store')
    .middleware('auth')
    .validator('Todos/Store')

  Route
    .delete(':id([0-9]+)', 'UserController.deleteTodo')
    .middleware('auth')
})
.prefix('user')

/**
 * TODOS
 */
Route
  .group(() => {
    Route
      .get('detail/:id([0-9]+)', 'ToDoController.index')
      .middleware('auth')

    Route
      .post('add-note/:id([0-9]+)', 'ToDoController.store')
      .middleware('auth')
      .validator('Note/Store')
    Route
      .patch('completed/:id([0-9]+)', 'ToDoController.updateTodo')
      .middleware('auth')
      .validator('Todos/UpdateStatus')
    
    Route
      .post('edit-note/:id([0-9]+)', 'ToDoController.update')
      .middleware('auth')
      .validator('Note/Update')

    Route
      .delete(':id([0-9]+)', 'ToDoController.deleteNote')
      .middleware('auth')

  })
  .prefix('todos')

