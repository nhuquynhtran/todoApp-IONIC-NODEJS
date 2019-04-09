'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, {response}) {
    console.log(error)
    switch (error.name) {
      case 'HttpException':
        let errorObj = error.message
        if (error.message && typeof error.message !== 'object')
          errorObj = {message: error.message}
        response.errorJSON(errorObj, error.status)
        return
      case 'Error':
        const errorArr = error.message.split('::')
        let errorMsg = error.message
        let errorStatus = error.status
        if (errorArr.length === 2) {
          if (errorArr[0] && !Number.isNaN(parseInt(errorArr[0], 10))) {
            errorStatus = parseInt(errorArr[0], 10)
            errorMsg = errorArr[1]
          }
        }
        response.errorJSON({message: errorMsg}, errorStatus)
        return
      default:
        response.errorJSON(error.message, error.status)
        return
    }
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, {request}) {
    //
  }
}

module.exports = ExceptionHandler
