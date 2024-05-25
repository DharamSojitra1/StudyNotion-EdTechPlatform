const Section = require("../models/Section");
const Course = require("../models/Course");

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
        );

        //HW : USE Populate to replace sections/sub-section both in the updatedCourseDetails

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

exports.updatedSection = async(req,res) => {
    try {
        //data fetch 
        const {sectionName, sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionIdId) {
            return res.status(400).json({
                success:false,
                message:'All Fields are Required',
            });
        }

        //Update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

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
        const {sectionId} = req.params;

        //Use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        //TODO[testing] : DO we need to delete the entry from the course schema?

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