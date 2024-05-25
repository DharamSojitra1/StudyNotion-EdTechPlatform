const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utlis/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose, trusted } = require("mongoose");

//capture the payment and initiate the Razorpay order

exports.capturePayment = async(req, res) => {
    try {
        //get courseId and User iD
        const {course_id} = req.body;
        const userId = req.user.id;
        
        //Validation

        //valid corseId
        if(!course_id){
            return res.json({
                success:false,
                message:'Please provide valid course Id',
            });
        };
        
        // valid courseDetail
        let course;
        try {
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:'Could not find the course'
                });
            }

            //User already pay for same course
            const uid = new mongoose.Types.ObjectId(userid);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            } 
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }

        //Order Create
        const amount= course.price;
        const currency = "INR";

        const options = {
            amount:amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId,
            }
        };

        try {
            //Initiate the payment using Razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            //Return Response
            return res.status(200).json({
                success:true,
                coursename:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount, 
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success:false,
                message:'Could not Initiate order',
            });
        }
    } catch (error) {
        
    }
};

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));

    const digest = shasum.digest("hex");

    if(signature == digest){
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            // Fulfill the action

            //Find the course amd enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                                            {id: courseId},
                                            {$push: {studentsEnrolled: userId}},
                                            {new: true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course Not Found',
                });
            }

            console.log(enrolledCourse);

            //find the student and add the course to their list enrolled courses 
            const enrolledStudent = await User.findByIdAndUpdate(
                                                {id: userId},
                                                {$push: {courses:courseId}},
                                                {new: true},
            );

            console.log(enrolledStudent);

            // Mail send Confirmation
            const emailResponse = await mailSender(
                                            enrollment.email,
                                            "Congratulations From StudyNotion",
                                            "Congratulations, you are onboarded into new StudyNotion Course",
            );

            console.log(emailResponse);

            return res.status(200).json({
                success:true,
                message:'Signature Verified and Course Added',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }
};