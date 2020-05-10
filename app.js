//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const app=express();

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());  
app.use(passport.session());

const userSchema= new mongoose.Schema ({
    email:String,
    password:String,
    googleId:String,
    facebookId:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);

// use static authenticate method of model in LocalStrategy
//passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy())
 
// use static serialize and deserialize of model for passport session support
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
     console.log(profile); 
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.route("/")
.get(function(req,res){
    res.render("home");
});

app.route("/login")
.get(function(req,res){
    res.render("login");
})
.post(function(req,res){
    
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user, function(err){
        if (err) { 
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.render("secrets");
            });
        }    
    });
});



app.route("/register")
.get(function(req,res){
    res.render("register");
})
.post(function(req,res){

    const username = req.body.username;
    const password = req.body.password;

    User.register({username:username}, password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.render("secrets");
            });
            
        }
    });    

});

app.route("/auth/google")
.get(passport.authenticate("google", {scope:["profile"]}));


app.route("/auth/google/secrets")
.get(passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.render("secrets");
  });

app.get("/auth/facebook",
passport.authenticate("facebook"));

app.get("/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.render("secrets");
  });

app.route("/secrets")
.get(function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});


app.route("/logout")
.get(function(req,res){
    req.logout();
    res.redirect("/");
});
let port= process.env.PORT;
if (port== null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on sucessfully");
});