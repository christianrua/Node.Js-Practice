//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

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
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

// use static authenticate method of model in LocalStrategy
//passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy())
 
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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