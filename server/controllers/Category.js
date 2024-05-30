const { Mongoose } = require("mongoose");
const Course = require('../models/Course');
const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

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

exports.showAllCategories = async(req, res) => {
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
        console.log("PRINTING CATEGORY ID: ", categoryId);

        //Get Courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                                .populate({
                                                    path: "courses",
                                                    match: { status: "Published" },
                                                    populate: "ratingAndReviews",
                                                })
                                                .exec();

        //validation
        if(!selectedCategory) {
            console.log("Category not found.")
            return res.status(404).json({
                success:false,
                message:'Data Not Found',
            });
        }

        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
            })
        }

        //Get course for different categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
          })
          let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
            .populate({
              path: "courses",
              match: { status: "Published" },
            })
            .exec()

        //Get Top selling courses 
        const allCategories = await Category.find()
            .populate({
            path: "courses",
            match: { status: "Published" },
            populate: {
                path: "instructor",
            },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        //return Response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differnetCategories,
                mostSellingCourses,                
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