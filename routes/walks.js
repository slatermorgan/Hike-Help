var express = require("express");
var router  = express.Router();
var Walk    = require("../models/walk");
var middleware = require("../middleware")

// INDEX - show all walks
router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all walks from DB
        Walk.find({name: regex}, function(err, allWalks){
            if(err){
                console.log(err);
            } else {
                res.render("walks/index", {walks: allWalks, currentUser: req.user})
            }
        });
    } else {
        // Get all walks from DB
        Walk.find({}, function(err, allWalks){
            if(err){
                console.log(err);
            } else {
                res.render("walks/index", {walks: allWalks, currentUser: req.user})
            }
        });
    }
});

// CREATE - adds new walk to DB
router.post("/", middleware.isLoggedIn, function(req, res){
        // get data from form + add to array
        var name = req.body.name;
        var image = req.body.image;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newWalk = {name:name, image:image, description:desc, author: author}
        // Create new walk and save to DB
        Walk.create(newWalk, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                // redirect back to walks page
                res.redirect("/walks")
            }
        })
});

// NEW - shows form to create new walk
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("walks/new");
});

// SHOW - shows more info about walk
router.get("/:id", function(req, res){
    // find the walk with provided ID
    Walk.findById(req.params.id).populate("comments").exec(function(err, foundWalk){
        if(err || !foundWalk){
            req.flash("error", "Walk not found");
            res.redirect("back");
        } else {
            console.log(foundWalk);
            // Render the show template
            res.render("walks/show", {walk: foundWalk});
        }
    });
});

// EDIT - allows editing with form
router.get("/:id/edit", middleware.checkWalkOwnership, function(req, res) {
    Walk.findById(req.params.id, function(err, foundWalk){
        res.render("walks/edit", {walk: foundWalk});
    });
});

// UPDATE - submits form
router.put("/:id", middleware.checkWalkOwnership, function(req, res){
    // find the update the walk
    Walk.findByIdAndUpdate(req.params.id, req.body.walk, function(err, updatedWalk){
        if(err){
            res.redirect("/walks");
        } else {
            res.redirect("/walks/" + req.params.id);
        }
    })
    // redirect to show page
});

// DESTROY - deletes walk
router.delete("/:id", middleware.checkWalkOwnership, function(req, res){
    Walk.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/walks");
        } else {
            res.redirect("/walks");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;