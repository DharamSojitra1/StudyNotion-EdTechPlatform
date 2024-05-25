const Profile = require("../models/Profile");
const User = require("../models/User");
const user = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        // Get Data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        //Get userId
        const id = req.user.id;

        //validtaion
        if(!contactNumber || !gender || !id) {
            return res.status(400).json({
                success:false,
                message:'All fields Are Required',
            });
        }

        // Find Profile 
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //Update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            profileDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}

// Delete Account

exports.deleteAccount = async (req, res) => {
    try {
        //get id
        const id = req.user.id;
        //Validation
        const userDetails = await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User Not Found',
            });
        }
        //Delete Profile
        await Profile.findByIdAndDelete({_id:userDetails.addintionalDetails});
        //HW unreoll user for  all course
        //Delete User
        await User.findByIdAndDelete({_id:id});

        //return Response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        }); 
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'User cannot be deleted',
        });
    }
};

//GetAllUserDetails
exports.getAllUserDetails = async(req, res) => {
    try {
        //get Id
        const id = req.user.id;

        //Validation
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response 
        return res.status(200).json({
            success:true,
            message:'User Data Fected Successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};