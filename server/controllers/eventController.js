const Event = require('../models/Event.js')

const createEvent = async (req,res) =>{
    try {
        const { title, description, location, clubName, date, time } = req.body;

        if (!title || !description || !location || !clubName || !date || !time) {
            return res.status(400).json({success:false , message : "Incomplete event details"})
        }

        const newEvent = await Event.create({
            title ,
            description ,
            location ,
            clubName ,
            date ,
            time
        })

        if(!newEvent){
            return res.status(500).json({success:false , message : "Error in creating event"})
        }

        return res.status(201).json({success:true , message : "Event created successfully" , event : newEvent})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false , message : "Error in creating event"})
    }
}

const getAllEvents = async (req,res) =>{
    try {
        const events = await Event.find({}); 
        return res.status(200).json({success:true , events : events})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false , message : "Error in fetching events"})
    }
}

module.exports = { createEvent , getAllEvents }