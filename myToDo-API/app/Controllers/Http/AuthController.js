const Config = use('Config')
const UserRepository = use('App/Repositories/User')
const {abort, httpCodes, messages} = use('App/Helper')
const moment = use('moment')

class AuthController {
    constructor() {
        this.userRepo = new UserRepository()
    }
    /**
     * login using jwt
     */
    async login({request, response, auth}) {
        // user input
        // rules: Validators/Auth/Login
        const {email, password} = request.all()

        // login n generate JWT token
        // abort request if can not attempt
        let token
        try {
            if (await auth.attempt(email, password)) {
                const loggedInUser = await this.userRepo.findOne({email})
                token = await auth.generate(loggedInUser)

                const output = Object.assign(loggedInUser, {token})

                return response.dataJSON(output)
            }
        } catch (e) {
            if (e.name === 'UserNotFoundException') {
                abort(httpCodes.unauthorized, messages.userIsNotFound)
            } else if (e.name === 'PasswordMisMatchException') {
                const tempUser = await this.userRepo.findOne({email})
                abort(httpCodes.unauthorized, messages.invalidPassword, 'password')
            } else {
                abort(httpCodes.unauthorized)
            }
        }
    }

    /**
     * refresh jwt token based on refresh token
     */
    async refreshToken({request, response, auth}) {
        // user input
        // rules: Validators/Auth/RefreshToken
        const refreshToken = request.input('refresh_token')

        // generate token
        // abort request if refresh token is invalid or revoked
        let token
        try {
        token = await auth.generateForRefreshToken(refreshToken, {forSite: Config.get('auth.forSites.client')})
        } catch (e) {
        abort(httpCodes.badRequest)
        }

        return response.dataJSON(token)
    }
    /**
     * user forgot password
     */
    async getVerificationCodeResetPassword({request, response}) {
        // rules: Validators/Auth/ForgotPassword
        const targetUser = await this.userRepo
        .findOne({email: request.input('email')})

        // check and abort request
        if (!targetUser || targetUser.isAccountDeleted())
        abort(httpCodes.badRequest, messages.userIsNotFound)

        // generate forgot password verification code
        const result = await this.userRepo.setResetPasswordVerificationCode(targetUser)

        return response.dataJSON(result)
    }

  /**
   * reset password by token
   */
  async resetPassword({request, response}) {
    // rules: Validators/Auth/ResetPassword
    // get user by verification_code
    const verification_code = request.input('verification_code')

    const targetUser = await this
      .userRepo
      .findOne({verification_code: verification_code})

    // check user and abort request
    if (!targetUser)
      abort(httpCodes.badRequest, messages.invalidVerificationCode, 'verification_code')

    if (targetUser && targetUser.isAccountDeleted())
      abort(httpCodes.badRequest, messages.userIsDeleted)

    if (moment().isAfter(targetUser.verification_code_expires))
      abort(httpCodes.badRequest, messages.verificationCodeExpired)

    // set new password
    await this.userRepo.setPassword(targetUser, request.input('password'))

    return response.dataJSON()
  }

  /**
   * reset password by verify code
   */
  async ResetPasswordByVerifyCode({request, response}) {
    // rules: Validators/Auth/ResetPassword
    // get user by verification_code
    const verification_code = request.input('verification_code')

    const targetUser = await this
      .userRepo
      .findOne({verification_code: verification_code})

    // check user and abort request
    if (!targetUser)
      abort(httpCodes.badRequest, messages.invalidVerificationCode, 'verification_code')

    if (targetUser && targetUser.isAccountDeleted())
      abort(httpCodes.badRequest, messages.userIsDeleted)

    if (moment().isAfter(targetUser.verification_code_expires))
      abort(httpCodes.badRequest, messages.verificationCodeExpired)

    // set new password
    await this.userRepo.setPassword(targetUser, request.input('new_password'))

    return response.dataJSON(targetUser)
  }
}

module.exports = AuthController