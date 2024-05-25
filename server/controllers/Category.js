const Category = require("../models/Category");

// Create Category Handler Function

exports.createCategory = async (req, res) => {
    try {
        //Fetch Data
        const {name, description} = req.body;

        //Validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All Feilds are required',
            });
        }

        //Create entry in DB
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

        //Return Response

        return res.status(200).json({
            success:true,
            message:'Category Created Successfully',
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//GetALLCategory handler function

exports.showAllCategory = async(req, res) => {
    try {
        const allCategory = await Category.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:'All Category returned successfully',
            allCategory,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//Category PageDetails

exports.categoryPageDetails = async(req,res) => {
    try {
        //Get categoryId
        const {categoryId} = req.body;

        //Get Courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                                .populate("courses")
                                                .exec();

        //validation
        if(!selectedCategory) {
            return res.status(404).json({
                success:false,
                message:'Data Not Found',
            });
        }

        //Get course for different categories
        const differnetCategories = await Category.find({
                                                    _id:{$ne:categoryId},
                                                    })
                                                    .populate("courses")
                                                    .exec();

        //Get Top selling courses 
        //Hw
        //return Response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differnetCategories,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}