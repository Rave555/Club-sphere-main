const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : true , 
        trim : true
    },
    description : {
        type : String ,
        required : true , 
        trim : true
    },
    location : {
        type : String ,
        required : true , 
        trim : true
    },
    clubName : {
        type : String ,
        required : true , 
        trim : true
    },
    date : {
        type : String ,
        required : true , 
        trim : true
    },
    time : {
        type : String ,
        required : true , 
        trim : true
    }    
})

module.exports = mongoose.model("Event" , eventSchema)