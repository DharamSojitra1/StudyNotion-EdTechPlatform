const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utlis/imageUploader");

//CreateCourse handler Function
exports.createCourse = async (req, res) => {
    try {
        // Fetch Data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get Thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success:false,
                message:'All fields are Required',
            });
        }

        //Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails );

        if(!instructorDetails) {
            return res.status(404).json({
                success:false,
                message:'Instructor Details not Found',
            });
        }

        // Check given Tag is Valid or not 
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success:false,
                message:'Tag Details not Found',
            });
        }

        //Upload Image To Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //Create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //Add the new course to the user schema of Instructor

        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        );

        //Update the Tag Schema 
        // HW

        //return response 
        return res.status(200).json({
            success:true,
            message:'Course Created Successfully',
            data:newCourse,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Failed to Create Course',
            error:error.message,
        });
    }
};

// Get AllCourses handler function

exports.showAllCourses = async(req, res) => {
    try {
        const allCourses = await Course.find({});

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        });
    }
};

// getCourseDetails

exports.getCourseDetails = async(req, res) => {
    try {
        // Get Id
        const {courseId} = req.body;
        
        //Find Course Details
        const courseDetails = await Course.find(
                                    {_id:courseId})
                                    .populate(
                                        {
                                            path:"instructor",
                                            populate:{
                                                path:"additionalDetails",
                                            },
                                        }
                                    )
                                    .populate("category")
                                    .populate("ratingAndReviews")
                                    .populate({
                                        path:"courseContent",
                                        populate:{
                                            path:"subSection",
                                        },
                                    })
                                    .exec();

        //Validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course whit ${courseId}`,
            });
        }

        //Return Response
        return res.status(200).json({
            success:true,
            message:'Course Details fetched successfully',
            data:courseDetails,
        });


    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};