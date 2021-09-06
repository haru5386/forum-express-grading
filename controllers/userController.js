const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '65c1a1c6b9b617c'
const helpers = require('../_helpers');
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userController = {
  signUpPage: (req, res,next) => {
    return res.render('signup')
  },
  signUp: (req, res,next) => {
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
        }).catch(err => next(err))
    }
  },
  signInPage: (req, res,next) => {
    return res.render('signin')
  },

  signIn: (req, res,next) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res,next) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res,next) => {
    User.findByPk(req.params.id)
      .then(user => {
        if (!user) {
          res.redirect('/')
        }
      }).catch(err => next(err))

    return Promise.all([User.findByPk(req.params.id), Comment.findAndCountAll({
      raw: true,
      nest: true,
      where: { UserId: req.params.id },
      include: Restaurant
    })])
      .then(value => {
        const [user, comment] = value
        const count = comment.count
        const set = new Set()
        const filterData = comment.rows.filter(item => !set.has(item.Restaurant.id) ? set.add(item.Restaurant.id):false)
        const resCount = filterData.length
        const commentData = filterData.map(comment => ({
          ...comment,
          restaurantId: comment.Restaurant.id,
          restaurantImage: comment.Restaurant.image
        }))
        res.render('profile', { nowUser: req.user, user: user.toJSON(), resCount:resCount,count: count, comment: commentData })
      })
      .catch(err => next(err))
  },
  editUser: (req, res,next) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      return res.redirect(`/users/${req.params.id}`)
    } else {
      User.findByPk(req.params.id)
        .then(user => res.render('editprofile', { user: user.toJSON() }))
        .catch(err => next(err))
    }

  },
  putUser: (req, res,next) => {
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
            }).catch(err => next(err))
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
          }).catch(err => next(err))
        })
    }
  },
  addFavorite: (req, res,next) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      }).catch(err => next(err))
  },
  removeFavorite: (req, res,next) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        if (!favorite) {
          req.flash('error_messages', 'It\'s not in favorites!')
          return res.redirect('back')
        } else {
          favorite.destroy()
            .then((restaurant) => {
              return res.redirect('back')
            }).catch(err => next(err))
        }

      })
  },
  addLike: (req, res,next) => {
    return Like.findOrCreate({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then((result) => {
      return res.redirect('back')
    }).catch(err => next(err))
  },
  removeLike: (req, res,next) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) {
          return res.redirect('back')
        } else {
          like.destroy()
            .then(restaurant => {
              return res.redirect('back')
            }).catch(err => next(err))
        }
      }).catch(err => next(err))
  },
  getTopUser: (req, res,next) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    }).catch(err => next(err))
  },
  addFollowing: (req, res,next) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      }).catch(err => next(err))
  },

  removeFollowing: (req, res,next) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      }).catch(err => next(err))
  }
}

module.exports = userController