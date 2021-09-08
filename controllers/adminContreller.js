const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const imgur = require('imgur-node-api')
const category = require('../models/category')
const Category = db.Category
const IMGUR_CLIENT_ID = '65c1a1c6b9b617c'
const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req,res,(data)=>{
      return res.render('admin/restaurants',data)
    })
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories: categories })
      }).catch(err => next(err))
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          categories: categories,
          restaurant: restaurant.toJSON()
        })
      })
    }).catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            }).then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
          }).catch(err => next(err))
      }).catch(err => next(err))
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            req.flash('success_messages', 'restaurant was successfully to update')
            res.redirect('/admin/restaurants')
          }).catch(err => next(err))
        }).catch(err => next(err))
    }
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => { return res.render('admin/users', { users: users }) })
      .catch(err => next(err))
  },
  toggleAdmin: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', 'This user can not be changed')
          return res.redirect('back')
        }
        user.isAdmin === false ? user.isAdmin = true : user.isAdmin = false
        return user.update({
          isAdmin: user.isAdmin
        })
          .then((user) => {
            req.flash('success_messages', 'User admin was successfully to update')
            res.redirect('/admin/users')
          })
      })

      .catch(err => next(err))
  }
}

module.exports = adminController