var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user")

//Root Route
router.get("/", function(req, res){
   res.render("landing")
});

// Register Form Route
router.get("/register", function(req, res) {
    res.render("register");
})
// handle signup logic
router.post("/register", function(req, res) {
    var newUser = ({username: req.body.username});
    if(req.body.adminCode === "secretcode69"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Hike Help " + user.username);
            res.redirect("/walks");
        });
    });
})

// show login form
router.get("/login", function(req, res) {
    res.render("login");
});
//handle login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/walks",
        failureRedirect: "/login",
        failureFlash: true    
        
    }), function(req, res) {
});

// logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged Out Sucessfully");
    res.redirect("/walks");
});

module.exports = router;