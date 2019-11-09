require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Walk = require("./models/walk"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
    walkRoutes = require("./routes/walks"),
    indexRoutes = require("./routes/index");

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); //seeds the database

// Passport Config
app.use(require("express-session")({
    secret: "snowdonia walks are the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passes the currentUser variable to every route
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Uses the route files
app.use(indexRoutes);
app.use("/walks", walkRoutes);
app.use("/walks/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Hike Help Server Initilised" + process.env.IP);
});