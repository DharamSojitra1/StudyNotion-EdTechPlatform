const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth

exports.auth = async(req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");

        //if token missing , then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            })
        }
        //Verify the Token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (err) {
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'Token is Invalid'
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message:'Something went Wrong While Valindating the token',
        });
    }
}

// isStudent

exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:'This is Protected route for Students Only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).josn({
            success:false,
            message:'User role cannont be Verified, Please Try Again!!!'
        });
    }
};

// isInstructor

exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:'This is Protected route for Instructor Only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).josn({
            success:false,
            message:'User role cannont be Verified, Please Try Again!!!'
        });
    }
};

// isAdmin

exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:'This is Protected route for Admin Only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).josn({
            success:false,
            message:'User role cannont be Verified, Please Try Again!!!'
        });
    }
};