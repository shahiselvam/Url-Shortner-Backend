const joi = require("joi");


// registration validation
const registervalidation = (data) =>{
    const scheme = joi.object({
   FirstName:joi.string().min(3),
   LastName:joi.string().min(1),
   email: joi.string().min(6).email().required(),
   password: joi.string().min(8).required(),
   confirmpassword: joi.any().valid(joi.ref('password')).required(),
   
   
    })
   
    return scheme.validate(data);
   
   
   }
//login Validation
   const loginValidation = (data) => {

    const scheme = joi.object({

        email: joi.string().min(6).email().required(),
        password: joi.string().min(8).required()
        
        
         })
        
         return scheme.validate(data);
}

//Reset validation

const resetValidation = (data) => {

    const scheme = joi.object({

        password: joi.string().min(8).required(),
        confirmpassword: joi.any().valid(joi.ref('password')).required(),

    })
    return scheme.validate(data);
}



   module.exports = {

    registervalidation ,
    loginValidation,
    resetValidation
   }