import Visits from "../models/visits.model.js";
import Customers from "../models/customers.model.js";
import User from "../models/User.js";

// Create a new visit

const createVisit = async (req, res) => {
    const user_id = req.user.id;
    const { customer_id, latitude, longitude, purpose, date, remarks } = req.body;

    // 2. Validation: Zaroori fields check karna
    if (!customer_id || !user_id || !latitude || !longitude || !purpose || !date) {
        return res.status(400).json({ message: "All Fields are Required" });
    }

    // visit creation

    try {


        const newVisit = await Visits.create({
            customer_id: customer_id,
            user_id: user_id,
            latitude: latitude,
            longitude: longitude,
            purpose: purpose,
            date: date,
            remarks: remarks
        });

        if(!newVisit){
            return res.status(500).json({ message: "Failed to create visit" });
        }
        

        res.status(201).json({
            message: "Visit Created Successfully",
            visit: newVisit
        });
    }
    catch (error) {
        console.error("Error creating visit:", error);
        res.status(500).json({ message: "Server Error" });
    }
}


export { createVisit };