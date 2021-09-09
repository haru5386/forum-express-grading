const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const categoryController = {
  getCategories: (req, res, callback, next) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              callback({ category: category.toJSON(), categories: categories })
            })
        } else {
          callback({ categories: categories })
        }
      }).catch(err => next(err))
  },
  postCategory: (req, res, callback, next) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          callback({ status: 'success', message: 'Category was successfully created' })
        }).catch(err => next(err))
    }
  },
  putCategory: (req, res, callback, next) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update({ name: req.body.name })
            .then((category) => {
              callback({ status: 'success', message: 'Category was successfully updated' })
            })
        }).catch(err => next(err))
    }
  },
  deleteCategory: (req, res, callback, next) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then(() => { callback({ status: 'success', message: '' }) })
          .catch(err => next(err))
      }).catch(err => next(err))
  }
}

module.exports = categoryController