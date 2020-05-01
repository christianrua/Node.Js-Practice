//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const md5 = require("md5");


const app=express();


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true, useUnifiedTopology: true});

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

const userSchema= new mongoose.Schema ({
    email:String,
    password:String
});






const User=new mongoose.model("User",userSchema);

app.route("/")
.get(function(req,res){
    res.render("home");
});

app.route("/login")
.get(function(req,res){
    res.render("login");
})
.post(function(req,res){
    const userName=req.body.username;
    const password=md5(req.body.password);
    User.findOne({email:userName},function(err,userFound){
        if(err){
            console.log(err);
            res.send("<h1>invalidad email or password.</h1>");
        } else {
            if(userFound){
                if(userFound.password==password){
                    res.render("secrets");
                } else {
                    res.send("<h1>invalidad email or password.</h1>");
                }
            }
        }
    });
});



app.route("/register")
.get(function(req,res){
    res.render("register");
})
.post(function(req,res){
    const user=new User({
        email: req.body.username,
        password: md5(req.body.password)
    });

    user.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    });
});


let port= process.env.PORT;
if (port== null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on sucessfully");
});