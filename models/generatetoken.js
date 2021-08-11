const jwt = require('jsonwebtoken');



const generateToken = (user , res) => {

    const expiration = process.env.DB_ENV === 'testing' ? 100 : 604800000;

    const token = jwt.sign({ _id:user._id , FirstName:user.FirstName , LastName:user.LastName , email:user.email} , process.env.TOKEN_SECRET, {
        expiresIn: process.env.DB_ENV === 'testing' ? '1d' : '7d',
      });

        res.cookie('access_token' , token ,{
        expires: new Date(Date.now() + expiration),
         secure: true, // set to true if your using https
        httpOnly: true,
        SameSite : None

      });
}

module.exports = {

    generateToken
}
