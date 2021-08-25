const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    password: 'password',
    passReqToCallback: true
  },
    (req, username, password, done) => {
  User.findOne({ where: {email: username} })
  .then(user=> {
    if (!user) return done(null, false, req.flash('error_messages','帳號不存在'))
    if (!bcrypt.compareSync(password, user.password)) return done(null, false, req.flash('error_messages', '密碼輸入錯誤'))
    return done(null, user)
  })
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON() // 此處與影片示範不同
    return cb(null, user)
  })
})

module.exports = passport