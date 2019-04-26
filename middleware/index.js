var Walk = require("../models/walk");
var Comment = require("../models/comment");

// All Middleware goes here
var middlewareObj = {};

middlewareObj.checkWalkOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        // does user own walk?
        Walk.findById(req.params.id, function(err, foundWalk){
            if(err || !foundWalk){
                req.flash("error", "Walk not found")
                res.redirect("back")
            } else {
                // does the user own walk?
                // if foundWalk.author.id === req.user._id
                if(foundWalk.author.id.equals(req.user._id)){
                    next(); 
                } else {
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        // does user own walk?
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // does the user own comment?
                // if foundComment.author.id === req.user._id
                if(foundComment.author.id.equals(req.user._id)){
                    next(); 
                } else {
                    req.flash("error", "You dont have permission to do that")
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
} 

module.exports = middlewareObj