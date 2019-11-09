var express = require("express");
var router  = express.Router();
var Walk    = require("../models/walk");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX - show all walks
router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all walks from DB
        Walk.find({name: regex}, function(err, allWalks){
            if(err){
                console.log(err);
            } else {
                if(allWalks.length > 0) {
                    res.render("walks/index",{walks :allWalks});
                } else {
                    req.flash("error", "No walk matching that search. Please try again.");
                    res.redirect("back");
                }
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

//CREATE - add new walk to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to walk array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var difficulty = req.body.difficulty;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }

        var lat = data[0].latitude;
        var lng = data[0].longitude;
        
        var location = data[0].formattedAddress;
        var newWalk = {
                name: name,
                image: image,
                description: desc,
                author:author,
                location: location,
                difficulty: difficulty,
                lat: lat,
                lng: lng
            };

        // Create a new walk and save to DB
        Walk.create(newWalk, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to walks page
                console.log(newlyCreated);
                res.redirect("/walks");
            }
        });
    });
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

// UPDATE WALK ROUTE
router.put("/:id", middleware.checkWalkOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        console.log('req.body:');
        console.log(req.body);
        req.body.walk.lat = data[0].latitude;
        req.body.walk.lng = data[0].longitude;
        req.body.walk.location = data[0].formattedAddress;

        Walk.findByIdAndUpdate(req.params.id, req.body.walk, function(err, walk){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/walks/" + walk._id);
            }
        });
    });
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