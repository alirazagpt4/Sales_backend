import Startday from "../models/startday.model.js";

const createStartday = async (req, res) => {
    // const {location , meterReadings, photoUri} = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user from authentication middleware
    const imagePath = req.files && req.files.image ? req.files.image[0].path : null;
    if (!req.body.data) {
        return res.status(400).json({ message: 'Submission data (location, reading) missing.' });
    }

    const data = JSON.parse(req.body.data);
    const { location, meterReadings, isLeave } = data;

    // --- 1. Validation Logic Change ---
    if (!isLeave) {
        // Agar chutti nahi hai, toh purani validations check karo
        if (!location || !meterReadings || !location.latitude || !location.longitude) {
            return res.status(400).json({ message: 'Missing required location or reading data for field work.' });
        }
    }




    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID is missing.' });
    }



    try {
        const newStartday = await Startday.create({
            userId: userId,
            is_leave: isLeave || false,
            status: isLeave ? 'LEAVE' : 'PRESENT',
            location_latitude: isLeave ? null : location.latitude,
            location_longitude: isLeave ? null : location.longitude,
            location_timeStamp: isLeave ? new Date() : location.timeStamp,
            startReading: isLeave ? null : meterReadings,
            photoUri: isLeave ? null : imagePath
        });

        res.status(201).json({
            message: isLeave ? 'Leave record created successfully.' : 'Startday record created successfully.',
            data: newStartday
        });

    } catch (error) {
        res.status(500).json({
            message: isLeave ? 'Error creating leave record.' : 'Error creating Startday record.',
            error: error.message
        });
    }
}


export { createStartday };