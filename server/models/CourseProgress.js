const mongoose = require("mongoose");

const courseProcessSchema = new mongoose.Schema({
    
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    completedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection"
        }
    ],

});

module.exports = mongoose.model("CourseProgress", courseProcessSchema); 