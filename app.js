const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./models')
const { urlencoded } = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const app = express()
const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs',helpers: require('./config/handlebars-helpers') }))
app.set('view engine', 'hbs')

app.use('/upload', express.static(__dirname + '/upload'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app, passport)

app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.status(422)
  res.render('error')
})

module.exports = app
