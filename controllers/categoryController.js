const db = require('../models')
const category = require('../models/category')
const Category = db.Category
const categoryService = require('../services/categoryService')
let categoryController = {
  getCategories: (req, res, next) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/Categories', data)
    })
  },
  postCategory: (req, res, next) => {
    categoryService.postCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res, next) => {
    categoryService.putCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then(() => { res.redirect('/admin/categories') })
          .catch(err => next(err))
      }).catch(err => next(err))
  }
}
module.exports = categoryController