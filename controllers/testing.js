const testingRouter = require('express').Router()
const Item = require('../models/item')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
  await Item.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter