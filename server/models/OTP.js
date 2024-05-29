const mongoose = require("mongoose");
const mailSender = require("../utlis/mailSender");

const OTPSchema = new mongoose.Schema({
    
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },

});

// Function to send emails 

async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", otp);
        console.log("Email sent Successfully: ", mailResponse);
    } 
    catch (error) {
        console.log("Error occured while sending mails!!!", error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = mongoose.model("OTP", OTPSchema); 