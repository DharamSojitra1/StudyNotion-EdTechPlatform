const User = require("../models/User");
const mailSender = require("../utlis/mailSender");
const bcrypt = require("bcrypt");

// ResetPassword Token

exports.resetPasswordToken = async(req, res) => {
    try {
        //get email from req body
        const email = req.body.email;

        //check user for this email , email validation
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success:false,
                message:'Your Email is not Registered with us',
            });
        }

        //Generate Token
        const token = crypto.randomUUID();

        //Update user by adding token and expiration time 
        const updateDetails = await User.findByIdAndUpdate(
                                                            {email:email},
                                                            {
                                                                token:token,
                                                                resetPasswordExpires:Date.now() + 5*60*1000,
                                                            },
                                                            {new: true}
        );

        //Create URL
        const url = `https://localhost:3000/update-password/${token}`;

        //Send Mail containg the url
        await mailSender(email,"Password Reset Link", `Password Reset Link: ${url}`);

        // Return Response

        return res.json({
            success:true,
            message:'Email Sent Successfully, Please check email and change Password',
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Went Wrong while sending reset Password mail',
        });
    }
};


//Reset Password

exports.resetPassword = async(req, res) => {
    try {
        //data Fetch
        const{password, confirmpassword, token} = req.body;

        //validation
        if(password !== confirmpassword) {
            return res.json({
                success:false,
                message:'Password Not Matched',
            });
        }
        //Get userDetails from DB using token
        const userDetails = await user.findOne({token: token});
        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is Invalid',
            });
        }
        //Token Time Check
        if( userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success:false,
                message:'Token is expired, Please Regenerate your Token',
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Password Update
        await User.findByIdAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        //Return Response
        return res.status(200).json({
            success:true,
            message:'Password Reset successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Went Wrong while sending reset Password mail',
        });
    }
};