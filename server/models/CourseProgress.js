const mongoose = require("mongoose");

const courseProcessSchema = new mongoose.Schema({
    
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    completedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection"
        }
    ],

});

module.exports = mongoose.model("CourseProgress", courseProcessSchema); 