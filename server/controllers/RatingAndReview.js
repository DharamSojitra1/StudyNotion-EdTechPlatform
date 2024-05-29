const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose  = require("mongoose");

//Create Rating
exports.createRating = async(req, res) => {
    try {
        // get user id 
        const userId = req.user.id;

        //fetch data from req body
        const {rating, review, courseId} = req.body;

        //check if user is enrolled or not 
        const courseDetails = await Course.findOne({
                                            _id:courseId,
                                            studentsEnrolled: {$elemMatch: {$eq: userId}},
        });

        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:'student is not enrolled in the course ',
            })
        }

        //Check is User already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                        user:userId,
                                                        course:courseId,
        });

        if(alreadyReviewed) {
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }

        //Create Rating and Review
        const ratingReview = await RatingAndReview.create({
                                                    rating,
                                                    review,
                                                    course:courseId,
                                                    user:userId,
        });

        //Update Course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                                                    {
                                                                        $push:{
                                                                            ratingAndReviews: ratingReview._id,
                                                                        }
                                                                    },
                                                                    {new: true},
        );
        console.log(updatedCourseDetails);

        //Return Response
        return res.status(200).json({
            success:true,
            message:'Rating and Review Created Successfully',
            ratingReview,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//Get Average Rating

exports.getAverageRating = async (req, res) => {
    try {
        //Get course ID
        const courseId = req.body.courseId;

        //Calculate Avg Rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg: "Rating"},
                }
            }
        ])

        //Return Rating
        if(result.length > 0 ){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })
        }

        //if no rating / review exist
        return res.status(200).json({
            successs:true,
            message:'Average is 0, no ratings given till now ',
            averageRating:0,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//Get All RatingAndReviews

exports.getAllRating = async (req, res) => {
    try {
        const allReviews =  await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName",
                                    })
                                    .exec();

        return res.status(200).json({
            success:true,
            message:'All Reviews Fetched Successfully',
            data:allReviews,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}