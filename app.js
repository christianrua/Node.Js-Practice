//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const saltRounds=10;



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
    const password=req.body.password;


    User.findOne({email:userName},function(err,userFound){
        if(err){
            console.log(err);
            res.send("<h1>invalidad email or password.</h1>");
        } else {
            if(userFound){

                bcrypt.compare(password, userFound.password, function(err, result) {
                    if(!err && result){
                        res.render("secrets");
                    } else {
                        res.send("<h1>invalidad email or password.</h1>");
                    }
                });
                
            }
        }
    });
});



app.route("/register")
.get(function(req,res){
    res.render("register");
})
.post(function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        if(!err){
            const user=new User({
                email: req.body.username,
                password: hash
            });
        
            user.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.render("secrets");
                }
            });
        }else{
            console.log(err);
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