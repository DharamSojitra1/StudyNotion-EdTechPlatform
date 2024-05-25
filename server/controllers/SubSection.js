const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utlis/imageUploader");

//Create SubSection

exports.createSubSection = async(req, res) => {
    try {
        //Fetch Data from req body
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All Fields are required',
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create a subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //update section with this sub section ObjectID
        const updatedSection = await Section.findByIdAndUpdate( 
                                                            {_id:sectionId},
                                                            {
                                                                $push:{
                                                                    subSection:subSectionDetails._id,
                                                                }
                                                            },
                                                            {new:true},
        );

        // HW : LOG Updated section here , after adding populate query

        // return response 
        return res.status(200).json({
            success:true,
            message:'Sub Section Created Successfully',
            updatedSection,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Internal Server Error',
            error:error.message,
        });
    }
};


// HW Update Sub-Section

// HW Delete Sub-Section 