const express = require('express')
const app = express()
require('dotenv').config()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cors = require('cors')

const connectDB = require('./config/db.js')
const cloudinary = require('./config/cloudinary.js')
const authRouter = require('./routes/authRoutes.js')
const clubRoutes = require('./routes/clubRoutes.js')
const eventRoutes = require('./routes/eventRoutes.js')
const cloudinaryConnect = require('./config/cloudinary.js')

//Middlewares
app.use(morgan('dev'))
// Increase body limits to support base64 image uploads from mobile
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use(cookieParser())
app.use(cors( {
    origin: true,
    credentials: true,
}))
app.use(fileUpload({
    useTempFiles : true ,
    tempFileDir : '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    abortOnLimit: true,
    debug: true
}))
cloudinaryConnect()

//Routes
app.get('/' , (req,res)=>{
    res.send("Welcome to ClubSphere !!")
})
app.use('/api/auth' , authRouter)
app.use('/api/clubs' , clubRoutes)
app.use('/api/events' , eventRoutes)

//Db connect
connectDB()

//App Listen
const port = process.env.PORT || 8000
app.listen(port , ()=>{
    console.log(`Server is listening at ${port}`)
})