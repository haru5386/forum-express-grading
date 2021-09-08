const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res, callback, next) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants })
    }).catch(err => next(err))
  },
  getRestaurant: (req, res, callback, next) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      }).catch(err => next(err))
  },
  deleteRestaurant: (req, res, callback, next) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      }).catch(err => next(err))
  },
  postRestaurant: (req, res, callback, next) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
            callback({ status: 'success', message: 'restaurant was successfully created' })
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {

        callback({ status: 'success', message: 'restaurant was successfully created' })
      }).catch(err => next(err))
    }
  },
}

module.exports = adminController