const express = require("express");
const { date } = require("joi");
const router = express.Router();
const mongodb = require("../db/mongo");


router.get("/count" , async (req , res) => {


    const data = await mongodb.db.collection("shorten-Url").estimatedDocumentCount();
    res.status(200).send(data.toString());
})

router.get("/countdata" , async (req , res) =>{
 
const startDate = new Date();
const Enddate =  new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+7);
const today = startDate.toISOString();
const week = Enddate.toISOString();
console.log(startDate);
console.log(Enddate);
console.log(today);
console.log(week);
const data = await mongodb.db.collection("shorten-Url").find({date : {$gte:today , $lte:week}});
res.status(200).send(data);

})

module.exports = router;