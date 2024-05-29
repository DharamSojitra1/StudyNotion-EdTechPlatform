const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lasttName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    accountType:{
        type:String,
        enum:["Admin","Student","Instructor"],
        required:true,
    },
    addintionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile",
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],
    image:{
        type:String,
        required:true,
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProcess:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProcess",
        }
    ],
    
}, { timestamps: true }
);

module.exports = mongoose.model("User", userSchema); 