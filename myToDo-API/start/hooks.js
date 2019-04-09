
const {hooks} = require('@adonisjs/ignitor')

hooks.after.providersRegistered(() => {
  const Config = use('Config')
  const Validator = use('Validator')
  const Database = use('Database')
  const moment = use('moment')
  const View = use('View')

  const existsFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (value === null || value === undefined) {
      /**
       * skip validation if value is not defined. `required` rule
       * should take care of it.
       */
      return
    }

    const [table, column] = args
    const row = await Database.table(table).where(column, value).first()

    if (!row) {
      throw message
    }
  }

  Validator.extend('exists', existsFn)

  const dateFormatFn = async (data, field, message, args, get) => {
    const value = get(data, field)

    if (!value) {
      /**
       * skip validation if value is not defined. `required` rule
       * should take care of it.
       */
      return
    }

    const datetime = moment(value, 'YYYY-MM-DD HH:mm:ss', true)

    if (!datetime.isValid()) {
      throw message
    }
  }

  Validator.extend('dateformat', dateFormatFn)

  View.global('getConfig', param => (Config.get(param)))
})

hooks.after.providersBooted(() => {
  const Request = use('Adonis/Src/Request')
  const Response = use('Adonis/Src/Response')

  Response.macro('dataJSON', function(data = {}, status = 200) {
    this.status(status).json({
      success: true,
      data
    })
  })

  Response.macro('errorJSON', function(errors = {}, status = 400) {
    // pre process errors
    this.status(status).json({
      success: false,
      data: {errors}
    })
  })

  Request.macro('currentPage', function() {
    let page = 1
    let perPage = 100
    const perPageArr = [10, 12, 20, 40, 60]

    // get requested page
    if (!Number.isNaN(parseInt(this.input('page'), 10)))
      page = Math.abs(parseInt(this.input('page'), 10))

    // get requested per page in result
    if (!Number.isNaN(parseInt(this.input('perPage'), 10))) {
      const tempPerPage = Math.abs(parseInt(this.input('perPage'), 10))
      if (perPageArr.indexOf(tempPerPage) > -1) {
        perPage = tempPerPage
      }
    }

    return {page, perPage}
  })
})
