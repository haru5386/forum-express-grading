const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const categoryController = {
  getCategories: (req, res, callback,next) => {
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
  }
}

module.exports = categoryController