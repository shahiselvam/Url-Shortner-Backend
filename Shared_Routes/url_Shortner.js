const express = require("express");
const router = express.Router();
const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
const mongodb = require("../db/mongo");

router.post("/shorten", async (req, res) => {

    const { longUrl } = req.body;
    const baseUrl = req.headers.host;
  

    if (!validUrl.isUri(baseUrl)) {

        res.status(401).json({ result: "error", message: "Invalid Base Url" });
    }

    const urlCode = nanoid(10);

    if (validUrl.isUri(longUrl)) {

        try {
            let Url = await mongodb.db.collection("shorten-Url").findOne({ longUrl: longUrl });

            if (Url) {
                res.json({result: "Success", message: "Url Shorten Successfully" , Url})
            }

            else {
              const shortUrl = baseUrl +  '/sho/' + urlCode;
         

              const Url = {
                longUrl : longUrl,
                shortUrl:shortUrl,
                urlCode:urlCode,
                date: new Date()

              }

              await mongodb.db.collection("shorten-Url").insertOne(Url);
              res.json({result: "Success", message: "Url Shorten Successfully" , Url})

            }
        }
        catch (err) {
            console.log(err)
         res.status(401).json({err,result:"error" , message:"Invalid Url"})
         
        }
    }

    else{

        res.status(401).json({result:"error" , message:"Invalid Url"})
    }

})

router.get("/shorten" , async (req, res) =>{

    const  data = await mongodb.db.collection("shorten-Url").find().toArray();
    res.send(data);
})

router.get('/sho/:code' , async (req , res) => {
const Url = await mongodb.db.collection("shorten-Url").findOne({ urlCode: req.params.code });
 
if(Url) {

    return res.redirect(Url.longUrl);
}

else{

    res.status(401).json({result:"error" , message:"Invalid Url"})
}
})


 module.exports = router;
