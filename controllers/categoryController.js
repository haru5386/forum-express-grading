const db = require('../models')
const category = require('../models/category')
const Category = db.Category
let categoryController = {
  getCategories: (req, res,next) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              return res.render('admin/categories', { category: category.toJSON(), categories: categories })
            })
        } else {
          return res.render('admin/categories', { categories: categories })
        }
      }).catch(err => next(err))
  },
  postCategory: (req, res,next) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          res.redirect('/admin/categories')
        }).catch(err => next(err))
    }
  },
  putCategory: (req, res,next) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update({ name: req.body.name })
            .then((category) => {
              res.redirect('/admin/categories')
            })
        }).catch(err => next(err))
    }
  },
  deleteCategory: (req, res,next) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
        .then(() => { res.redirect('/admin/categories') })
          .catch(err => next(err))
      }).catch(err => next(err))
  }
}
module.exports = categoryController