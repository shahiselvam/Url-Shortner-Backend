const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongo = require("./db/mongo");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const auth_user = require("./Shared_Routes/auth_user");
const url_shortner = require("./Shared_Routes/url_Shortner");
const count = require('./Shared_Routes/count');



async function loadApp(){
    try
    {

mongo.connect();
app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })
app.use(cors({
    origin: [
    
    'https://mystifying-lichterman-73d159.netlify.app'
    
  ],
  credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.use('/' , auth_user);

app.use( (req,res,next) => {

const token = req.cookies.access_token;
console.log(token);
console.log(req.headers)
console.log(req.cookies)

if (!token) {
    return res.sendStatus(403);
  }
else{
try{

    const user = jwt.verify(token, process.env.TOKEN_SECRET);

    if(user){
     req.user = user;
        next();
    }
   
}
catch(err){
    res.redirect('http://localhost:3000/login')
    res.json({error: err} )
}
}
})
app.use(express.json());

app.use('/' , count);
app.use('/' , url_shortner);
const port = process.env.PORT || 7000;
app.listen(port , () =>console.log(`Application started at the port ${port}`));

    }

catch(err)
{

console.log(err);
console.log("error conecting to port");

}
}


loadApp(); 
