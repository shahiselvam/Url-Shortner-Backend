const express = require("express");
const router = express.Router();
const {registervalidation , loginValidation ,resetValidation} = require("../models/user");
const mongodb = require("../db/mongo");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const  { generateToken } = require("../models/generatetoken")

router.post("/registration" , async (req, res) =>{


    const { error } = await registervalidation(req.body);

    if(error){
        res.json({result: "error" , message : error.details[0].message})
        
    }

    else{

        const user = await mongodb.db.collection("userDetails").findOne({email : req.body.email})

        if(user){
              res.json({result:"error" , message:"Email Already Exist"});
           
        }

        else{

            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            req.body.confirmpassword = await bcrypt.hash(req.body.password, salt);

            const buf = crypto.randomBytes(20);
            const token = buf.toString('hex');

            const data={
               FirstName:req.body.FirstName,
               LastName:req.body.LastName,
               email:req.body.email,
               password:req.body.password,
               Activatetoken:token
              

            }
            await mongodb.db.collection("userDetails").insertOne(data);
         

            const smtpTransport = nodemailer.createTransport({

                service: 'Gmail',
                auth: {
                  user: 'email',
                  pass: 'password'
        
                }
        });

        const mailOptions = {

            to:req.body.email,
            from:'email',
            subject: 'Node.js Account Activation',
            text: 
                 'Please click on the following link, or paste this into your browser to Activate your account:\n\n' +
                 'https://' + mystifying-lichterman-73d159.netlify.app + '/activate/' + token + '\n\n'  
             };
             smtpTransport.sendMail(mailOptions, () => {
               console.log( 'Registered  Succesfully Account A activation e-mail has been sent to ' + req.body.email );
               
             });
       
             res.json({result: "success" , message : `'Regiasted  Succesfully Account A activation e-mail has been sent to ' + ${req.body.email}  ` })     
        }
    }
})


router.get("/activate/:token" , async (req, res) => {
  
    const user = await mongodb.db.collection("userDetails").findOne({Activatetoken: req.params.token});
   
    if(!user){
    
        
        res.json({result: "error" , message : "Activation token is invalid" })
    }

    else{

        const data={
            FirstName:user.FirstName,
            LastName:user.LastName,
            email:user.email,
            password:user.password,
            Activatetoken:undefined,
            Active:true
           

         }
         await mongodb.db.collection("userDetails").findOneAndUpdate({_id:user._id}, {$set :data })
        res.json({result: "Success" , message : "Account Activated" })
    }

    })

    router.post("/login" , async (req , res) =>{


        const { error } = await loginValidation(req.body);
    
        if(error){
            res.json({result: "error" , message : error.details[0].message})
            
        }
    
        else{
    
            const user = await mongodb.db.collection("userDetails").findOne({$and:[{email : req.body.email} ,{Active: true}]})
    
            
            if(!user){
                res.json({result: "error" , message : "Email Dosenot exist or Account is inactive"})
                
            }
            else{
    
           const isvalid = await bcrypt.compare(req.body.password , user.password)
    
           if(!isvalid){
            res.json({result: "error" , message : "Password dosen't match" })
            
           }
    
           else{
            await generateToken(user,res);
            res.json({result: "success" , message : "Login Successsfully",user })
           
           }
        }
        }
    
    })
    router.get('/login/:id' , async (req , res) =>{

        const data = await mongodb.db.collection("userDetails").findOne({_id:ObjectId(req.params.id)});
    
        res.send(data);
        
    })
    router.post("/forget" , async  (req , res ) => {

        const user = await mongodb.db.collection("userDetails").findOne({$and:[{email : req.body.email} ,{Active: true}]})
        
        
        
        if(!user){
            res.json({result: "error" , message : "Email id dosenot exist or Account is InActive" })
            res.status(401).send({ msg: "Email id dosenot exist or Account is InActive"})
        }
        
        else{
        const buf = crypto.randomBytes(20);
        
        const token = buf.toString('hex');
        
            const data = {
            FirstName:user.FirstName,
            LastName:user.LastName,
            email:user.email,
            password:user.password,      
            Activatetoken:undefined,
            Active:true,
            resetPasswordToken:token,
            resetPasswordExpires : Date.now() + 3600000
        
            }
        
            await mongodb.db.collection("userDetails").findOneAndUpdate({_id:user._id}, {$set :data })
        
        const smtpTransport = nodemailer.createTransport({
        
                service: 'Gmail',
                auth: {
                  user: 'shahiselvam21@gmail.com',
                  pass: 'shahi123'
        
                }
        });
        
        const mailOptions = {
        
             to:user.email,
             from:'email',
             subject: 'Node.js Password Reset',
             text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://localhost:3000/reset/' + token + '\n\n'  +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              smtpTransport.sendMail(mailOptions, () => {
                console.log('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                
              });
        
              res.json({result: "sucess" , message : `'info', 'An e-mail has been sent to '  ${user.email} ` })     
             
        
        }
        
        })
        router.get("/reset/:token" , async (req, res) => {
          
            const user = await mongodb.db.collection("userDetails").findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }});
           
            if(!user){
            
                // res.status(401).send({msg: "Password reset token is invalid or has expired."})
                res.json({result: "error" , message : "Password reset token is invalid or has expired." })
            }
        
            else{
        
                res.json({result: "Success" , message : "Valid token" })
            }
        
            })
        
            router.post("/reset/:token" , async (req , res) => {
        
                const user = await mongodb.db.collection("userDetails").findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }});
                if(!user){
            
                    res.json({result: "error" , message : "Password reset token is invalid or has expired." })
                }
        
                else{
        
                    const { error } = await resetValidation(req.body);
        
                    if(error){
                    res.json({result: "error" , message : error.details[0].message})
                    
                     }
                    else{
                    const salt = await bcrypt.genSalt(10);
                    req.body.password = await bcrypt.hash(req.body.password, salt)
        
                    const data = {
                        FirstName:user.FirstName,
                        LastName:user.LastName,
                        email:user.email,
                        password:req.body.password,
                        Activatetoken:undefined,
                        Active:true,
                        resetPasswordToken:undefined,
                        resetPasswordExpires : undefined
        
                    }
        
                    await mongodb.db.collection("userDetails").findOneAndUpdate({_id:user._id}, {$set :data })
                    
                    res.json({result: "Success" , message : "password reseted succesfully" })
                }
                    
                }
            })


    module.exports = router;
