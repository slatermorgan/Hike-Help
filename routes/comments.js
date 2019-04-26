var express = require("express");
var router  = express.Router({mergeParams: true});
var Walk    = require("../models/walk");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments - New Route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find walk by id
    Walk.findById(req.params.id, function(err, walk){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {walk: walk});
        }
    });
});

//Comments - Create Route
router.post("/", middleware.isLoggedIn, function(req, res){
    // look up walk by id
    Walk.findById(req.params.id, function(err, walk) {
        if(err){
            console.log(err)
            res.redirect("/walks");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username + id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    walk.comments.push(comment);
                    walk.save();
                    req.flash("success", "Sucessfully added comment");
                    res.redirect("/walks/" + walk._id);
                }
            })
        }
    })
});

// Comment Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Walk.findById(req.params.id, function(err, foundWalk) {
        if(err || !foundWalk){
            req.flash("error", "No Walk Found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {walk_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// Comment Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/walks/" + req.params.id );
        }
    });
});

// Comment Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/walks/" + req.params.id );
        }
    })
})

module.exports = router;