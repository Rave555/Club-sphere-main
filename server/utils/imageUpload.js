const cloudinary = require('cloudinary').v2

const uploadToCloudinary = async (file, folder, quality) => {
    const options = { folder }
    options.resource_type = "auto"
    if (quality) {
        options.quality = quality
    }
    // Support both file objects from express-fileupload and base64/data URLs
    const uploadSource = typeof file === 'string' ? file : file?.tempFilePath
    return await cloudinary.uploader.upload(uploadSource, options)
}
module.exports = uploadToCloudinary