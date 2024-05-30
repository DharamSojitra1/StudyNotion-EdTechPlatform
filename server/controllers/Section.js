const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// CREATE a new section
exports.createSection = async (req, res) => {
    try {
        //data fetch
        const {sectionName,  courseId} = req.body;

        //Data Validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'All Fields are Required',
            });
        }

        //Create Section
        const newSection = await Section.create({sectionName});

        //Update course with Section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                    courseId,
                                                    {
                                                        $push:{
                                                            courseContent:newSection._id,
                                                        }
                                                    },
                                                    {new:true},
                                                    ).populate({
                                                        path: "courseContent",
                                                        populate: {
                                                            path: "subSection",
                                                        },
                                                    })
                                                    .exec();    

        // return response 
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'Unable to create Section, Please Try Again',
            error:error.message,
        });
    }
};

exports.updateSection = async(req,res) => {
    try {
        //data fetch 
        const {sectionName, sectionId, courseId} = req.body;

        //data validation
        if(!sectionName || !sectionIdId) {
            return res.status(400).json({
                success:false,
                message:'All Fields are Required',
            });
        }

        //Update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

        //return response
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        });


    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'Unable to Update Section, Please Try Again',
            error:error.message,
        });
    }
};

exports.deleteSection = async(req, res) => {
    try {
        //Get ID - assuming that we are sending ID in params 
        const { sectionId, courseId }  = req.body;

        await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})

        //Use findByIdAndDelete
        const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);

        if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

        //delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

        //return Response
        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'Unable to Delete Section, Please Try Again',
            error:error.message,
        });
    }
}