const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res,next) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    }).then((comment) => {
      res.redirect(`/restaurants/${req.body.restaurantId}`)
    }).catch(err => next(err))
  },
  deleteComment: (req, res,next) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
        .then((comment) => {
          res.redirect(`/restaurants/${comment.RestaurantId}`)
        }).catch(err => next(err))
      }).catch(err => next(err))
  }
}

module.exports = commentController