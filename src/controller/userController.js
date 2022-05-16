const UserModel = require("../models/userModel")
const jwt=require('jsonwebtoken')
//const userModel = require("../models/userModel")




const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const createUser = async (req, res) => {
    try {
        //name validation name can only contain [a-z],[A-Z]and space
        const validateName = (name) => {
            return String(name).trim().match(
                /^[a-zA-Z][a-zA-Z\s]+$/);
        };

        //email validation function
        const validateEmail = (email) => {
            return String(email).trim()
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        // password validation function must contain capital,number and special symbol
        // const validatePassword = (password) => {
        //     return String(password).trim()
        //         .match(
        //             /^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#\$%\^&\*])(?=.{8,})/
        //         );
        // };

        //MOBILE NUMBER VALIDATION must be number start with 6,7,8,9 and of 10 digit 
        const validateNumber = (number) => {
            return String(number).trim().match(
                ///^(\+\d{1,3}[- ]?)?\d{10}$/
                /^[6-9]\d{9}$/gi
            )
        }

        //title be must be only of these Mr,Mrs,Miss
        const validateTitle = (title) => {
            return ["Mr", "Mrs", "Miss"].indexOf(title) != -1
        }

        //---------------------------------------FUNCTIONS------------------------------------------------------
        const data = req.body

        //check for empty body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "please enter some DETAILS!!!" })
        }

        //title is mandatory and must be in [Mr , Mrs , Miss]------------------------------------------------
        if (!data.title) {
            return res.status(400).send({ status: false, message: "TITLE is required!!!" })
        }
        if (!validateTitle(data.title)) {
            return res.status(400).send({ status: false, message: "TITLE is INVALID!!!" })
        }

        //check for user name---------------------------------------------------------------------------------
        if (!data.name) {
            return res.status(400).send({ status: false, message: "NAME is required!!!" })
        }
        if (!validateName(data.name)) {
            return res.status(400).send({ status: false, message: "NAME is INVALID!!!" })
        }

        //phone no---------------------------------------------------------------------------------------------

        if (!data.phone) {
            return res.status(400).send({ status: false, message: "User phone number is missing" })
        }
        if (!validateNumber(data.phone)) {
            return res.status(400).send({ status: false, message: "User phone number is INVALID" })
        }
        //check for unique phone number
        const phone = await UserModel.findOne({ phone: data.phone })
        if (phone) {
            return res.status(400).send({ status: false, message: "User phone number already exists" })

        }

        //email--------------------------------------------------------------------------------------------------
        if (!data.email)
            return res.status(400).send({ status: false, message: "email is missing" })

        if (!validateEmail(data.email)) {
            return res.status(400).send({ status: false, message: "Invaild E-mail id " })//email validation
        }
        //check for unique email
        const email = await UserModel.findOne({ email: data.email })
        if (email) {
            return res.status(400).send({ status: false, message: "email already exist" })
        }

        //password----------------------------------------------------------------------------------------------
        if (!data.password)
            return res.status(400).send({ status: false, message: "password is missing" })

        if (data.password.length < 8 || data.password.length > 15)
            return res.status(400).send({ message: "password length must be minimum of 8 and max of 15 character" })

        // if (!validatePassword(data.password)) {
        //     return res.status(400).send({ status: false, message: "password should contain atleast one number,one special character and one capital letter" })//password validation
        // }

       

        //address---------------------------------------------------------------------------------------------------
        let street = data.address.street
        let city = data.address.city
        let pincode = data.address.pincode
        if(street){
            let validateStreet = /^[a-zA-Z0-9]/
            if (!validateStreet.test(street)) {
                return res.status(400).send({ status: false, message: "enter valid street name" })
            }
        }

        if (city) {
            let validateCity = /^[a-zA-z',.\s-]{1,25}$/gm
            if (!validateCity.test(city)) {
                return res.status(400).send({ status: false, message: "enter valid city name" })
            }
        }
        if (pincode) {
            let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/gm      //must not start with 0,6 digits and space(optional)
            if (!validatePincode.test(pincode)) {
                return res.status(400).send({ status: false, message: "enter valid pincode" })
            }
        }



        //create user--------------------------------------------------------------------------------------------------
        const user = await UserModel.create(data)
        return res.status(201).send({ status: true, message: "user created successfully", data: user })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



const userLogin = async function(req,res){
    try {
       const requestBody= req.body;
       if(!isValidRequestBody(requestBody)){
           res.status(400).send({status:false, message:'Invalid request parameters, Please provide login details'})
           return
       }

       //Extract params
       const {email, password} = requestBody;

       //validation starts
       if(!isValid(email)){
           res.status(400).send({status:false, message:`Email is required`})
           return
       }
       
       if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
           res.status(400).send({status:false, message: `Email should be a valid email address`})
           return
       }

       if(!isValid(password)){
           res.status(400).send({status:false, message: `Password is required`})
           return
       }
       //validation ends

       const user = await UserModel.findOne({email,password});

       if(!user){
           res.status(400).send({status:false, message:`Invalid login credentials`});
           return
       }

       const token =  jwt.sign({
           userId: user._id,
           iat: Math.floor(Date.now() /1000),
           exp: Math .floor(Date.now() /1000) + 10 * 60 * 60
       },
       "My private key"
       );

       res.header('x-api-key',token);
       res.status(200).send({status:true, message:`User login successfully`, data:token});

   } catch (error) {
       res.status(500).send({status:false, message:error.message});
   }
}

module.exports = {createUser,userLogin}

