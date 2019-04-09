'use strict'

const Config = use('Config')
const Mail = use('Mail')
const moment = use('moment')

const UserModel = use('App/Models/User')
const BaseRepository = use('App/Repositories/Base')

const {abort, httpCodes, messages, verificationCodeGenerator} = use('App/Helper')

class User extends BaseRepository {
  constructor() {
    super(UserModel)
    this.user = UserModel
    this.email = Mail
  }

  /**
   * get single user by id / UserModel instance
   */
  async getSingle(i, currentLoggedInUser = null, relationshipParams = null) {
    const id = i instanceof this.user
      ? i.id
      : i

    const result = await this.user.query()
      .with('todos')
      .where('id', id)
      .first()

    return result
  }

  /**
   * update user
   */
  async update(i, attributes, trx = null, inputTrusted = true) {
    // update
    if (attributes.preferenceIds && attributes.preferenceIds.length)
      attributes.completed_registration = true
    const targetUser = await super.update(i, attributes, trx, inputTrusted)

    // update preferences
    if (attributes.preferenceIds && attributes.preferenceIds.length) {
      try {
        await targetUser.preferences().sync(attributes.preferenceIds)
      } catch (e) {
        abort(httpCodes.internalError)
      }
    }

    return targetUser
  }

  /**
   * set forgot password token
   */
  async setResetPasswordVerificationCode(i) {
    const targetUser = i instanceof this.user
      ? i
      : super.findOne(i)
    if (!targetUser)
      abort(httpCodes.notFound)

    try {
      // generate verification_code
      targetUser.verification_code = verificationCodeGenerator()
      targetUser.verification_code_expires = moment().add(Config.get('user.verificationCode.expires'), 'second').format('YYYY-MM-DD HH:mm:ss')
      console.log(targetUser.verification_code_expires)
      const result = await targetUser.save()
      // await super.update(targetUser, verificationCode, true)
      //console.log(result);
      const data = Object.assign(
        {user: targetUser},
      )
      Mail.send('emails.verification-code-for-user', data, message => {
        message
          .to(targetUser.email, targetUser.fullname)
          .from(Config.get('email.sender.email'), Config.get('email.sender.name'))
          .subject('Vefification code for reset password in My TODO app')
      })
      return result
    } catch (e) {
      console.log(e)
      abort(httpCodes.internalError)
    }
  }

  /**
   * verify account (use for both member and trainer)
   * for both user logged in and not
   */
  async verify({request, response, auth}) {
    // rules: Validators/Auth/Verify
    const loggedInUser = auth.user

    // check and abort request
    // auth required
    // only user in pendding verification status accepted (see middleware)
    // invalid code
    if (loggedInUser.verification_code !== request.input('verification_code'))
      abort(httpCodes.badRequest, messages.invalidVerificationCode)

    // code expired
    if (moment().isAfter(loggedInUser.verification_code_expires))
      abort(httpCodes.badRequest, messages.verificationCodeExpired, 'expiration')

    // all good, update user status
    // and register_step if loggedInUser first registered as a trainer
    await this.userRepo.update(loggedInUser, {status: Config.get('user.statuses.active')})

    if (loggedInUser.isFirstRegisteredAsTrainer()) {
      const targetTrainer = await loggedInUser.trainer().fetch()
      if (targetTrainer)
        await this.trainerRepo.update(targetTrainer, {
          register_step: 3
        })
    }

    // fire user verified event
    Event.fire('user::verified', loggedInUser)

    // generate token for the new account
    // because its status updated
    // client will use this token and data to set new auth
    let token
    try {
      token = await auth.generate(loggedInUser, {forSite: Config.get('auth.forSites.client')})
    } catch (e) {
      abort(httpCodes.internalError, messages.userCreatedButTokenGenFailed)
    }

    const output = Object.assign(loggedInUser, {token})

    // do not return targetUser here because
    // the user is may not be auth-ed right
    return response.dataJSON(output)
  }
  /**
   * set/update user password
   */
  async setPassword(i, password) {
    await super.update(i, {
      password,
      forgot_password_token: null,
      forgot_password_token_expires: null
    }, null, true)
  }
}

module.exports = User
