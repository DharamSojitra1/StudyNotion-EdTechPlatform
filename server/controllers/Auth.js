const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const mailSender = require("../utlis/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

// SEND OTP

exports.sendOTP = async (req, res) => {
    
    try{
        //fetch email from request body
        const {email} = req.body;

        //Check if User already exist  
        const checkUserPresent = await User.findOne({email});

        //If user Already exist , then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        //Generate OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP Generated",otp);

        //check unique otp or not 
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP Body:",otpBody);

        //return response successful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

};


// SignUP

exports.signUp = async (req, res) => {

    try {

        // Data fetch from request body 
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validate 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message:"All Fields are Required",
            })
        }

        // 2 Password matching
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password does not match, please Try Again!!!'
            });
        }

        //check user already exist or not 
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        // Find most recent OTP stored for the User
        const recentOtp = await OTP.findOne({email}).sort({createAt:-1}).limit(1);
        console.log(recentOtp);

        //validate OTP
        if(recentOtp.length == 0){
            // OTP not Found
            return res.status(400).json({
                success:false,
                message:'OTP Not Found',
            });
        } else if(otp !== recentOtp.otp){
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)

        // Entry in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lasttName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            addintionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initails/svg?seed=${firstName} ${lastName}`
        })

        // Return res
        return res.status(200).json({
            success:true,
            message:'User is Regietered Successfully',
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User Registration Failed, Please Try Again!!! '
        });
    } 
};

// Login

exports.login = async(req, res) => {

    try {
        // Get data from req body
        const {email, password} = req.body;

        //Validation Data
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'All Fields are Required, Please Try Again!!!'
            });
        }

        //User check if exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not Registered, Please SignUp First",
            });
        }

        //Generate JWT, after password matching
        if(await bcrypy.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn: "24h",
            });
            user.token = token;
            user.password = undefined;

            //Create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in Successfully',
            })

        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is Incorrect',
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, Please Try Again!!!'
        });
    }

};


//Change Password 
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);

			console.log("Email sent successfully:", emailResponse.response);

		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};