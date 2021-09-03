const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '65c1a1c6b9b617c'
const helpers = require('../_helpers');
const Comment = db.Comment
const Restaurant = db.Restaurant

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.password !== req.body.passwordCheck) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '帳號已經存在！')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then(user => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
          }
        })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        if (!user) {
          res.redirect('/')
        }
      }).catch(err => { console.log(err) })

    return Promise.all([User.findByPk(req.params.id), Comment.findAndCountAll({
      raw: true,
      nest: true,
      where: { UserId: req.params.id },
      include: Restaurant
    })])
      .then(value => {
        const [user, comment] = value
        const count = comment.count
        const commentData = comment.rows.map(comment => ({
          ...comment,
          restaurantId: comment.Restaurant.id,
          restaurantImage: comment.Restaurant.image
        }))
        console.log(commentData)
        res.render('profile', { nowUser: req.user, user: user.toJSON(), count: count, comment: commentData })
      })
      .catch(err => { console.log(err) })
  },
  editUser: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.params.id}`)
    } else {
      User.findByPk(req.params.id)
        .then(user => res.render('editprofile', { user: user.toJSON() }))
    }

  },
  putUser: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image,
            }).then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image,
          }).then((user) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${user.id}`)
          })
        })
    }
  }
}

module.exports = userController