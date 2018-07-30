var createError = require('http-errors')
var express = require('express')
var path = require('path')
var fs = require('fs')
var wavebar = require('./wavebar')

var app = express()
app.use(express.static(`${__dirname}/public`))


/* GET home page. */
app.use(wavebar.init)
app.get('/', (req, res, next) => {
  console.log('------------------------------>')
  const data = {
    content: fs.readFileSync(`${__dirname}/templates/home.html`, 'utf8'),
    parts: {
      header: fs.readFileSync(`${__dirname}/templates/parts/header.html`, 'utf8'),
      footer: fs.readFileSync(`${__dirname}/templates/parts/footer.html`, 'utf8'),
      name: fs.readFileSync(`${__dirname}/templates/parts/name.html`, 'utf8'),
    },
    wraps: {
      html: fs.readFileSync(`${__dirname}/templates/wraps/html.html`, 'utf8'),
      wrapper: fs.readFileSync(`${__dirname}/templates/wraps/wrapper.html`, 'utf8'),
    },
    params: {
      name: 'home',
      unique : 'unique',
      sign  : 'sign ',
      user   : 'user  ',
      sign  : 'sign ',
      items   : {},
    }
  }
  res.wbRender(data)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found!')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500)
  res.send(`${err.message}<br>${err.stack}`.replace(/\n/, '<br>'))
})

module.exports = app