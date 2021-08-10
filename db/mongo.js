const {MongoClient} = require("mongodb");

const mongo = {
    db : null,


async connect(){
    try{

const dbconnect = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });

this.db = dbconnect.db(process.env.MONGODB_NAME);


console.log(`mongo db connected at ${process.env.MONGODB_NAME}`)
}
catch(err){

   console.log(err);
   console.log("error connecting to database") ;
   process.exit();
}
}




}

module.exports = mongo;

