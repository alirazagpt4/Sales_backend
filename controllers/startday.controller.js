import Startday from "../models/startday.model.js";

const createStartday = async (req , res) =>{
    // const {location , meterReadings, photoUri} = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user from authentication middleware
    const imagePath = req.files && req.files.image ? req.files.image[0].path : null;
    if (!req.body.data) {
        return res.status(400).json({ message: 'Submission data (location, reading) missing.' });
    }
    const data = JSON.parse(req.body.data);
    const { location, meterReadings } = data;

    // 3. Validation
    if (!location || !meterReadings || !location.latitude || !location.longitude) {
        return res.status(400).json({ message: 'Missing required location or reading data.' });
    }

    if(!userId){
        return res.status(401).json({ message: 'Unauthorized: User ID is missing.' });
    }


    
    try {
        const newStartday = await Startday.create({
            userId:userId,
            location_latitude: location.latitude,
            location_longitude: location.longitude,
            location_timeStamp: location.timeStamp,
            startReading: meterReadings,
            photoUri: imagePath
        });

        res.status(201).json({
            message: 'Startday record created successfully.',
            data: newStartday
        });
        
    } catch (error) {
        res.status(500).json({
            message: 'Error creating Startday record.',
            error: error.message
        });
    }
}


export { createStartday };