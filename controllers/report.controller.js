import Visits from '../models/visits.model.js';
import User from '../models/User.js';
import Startday from '../models/startday.model.js';
import Customers from '../models/customers.model.js';
import City from '../models/City.js';
import { Op, Sequelize } from 'sequelize';

export const generateDailyVisitReport = async (req, res) => {
    try {
        // Query params: ?name=Furqan&city=Faisalabad&date=2025-12-11
        const { name, city, date } = req.query;

        if (!name || !city || !date) {
            return res.status(400).json({ error: "Name, City, and Date are all required" });
        }

        // 1. Pehle User aur City ki ID find karein (Filtering ke liye)
        const user = await User.findOne({
            where: { name: name },
            include: [{
                model: City,
                as: 'cityDetails',
                where: { name: city } // City name filter yahan apply hoga
            }]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found in the specified city" });
        }

        const user_id = user.id;

        // 2. Us din ki Meter Reading nikalna (Startday table se)
        const dayInfo = await Startday.findOne({
            where: {
                userId: user_id,
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('createdAt')), date)
                ]
            },
            attributes: ['startReading']
        });

        // 3. Visits fetch karna Joins ke saath
        const visits = await Visits.findAll({
            where: {
                user_id: user_id,
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('visits.createdAt')), date)
                ]
            },
            include: [
                {
                    model: Customers,
                    attributes: ['customer_name', 'area', 'type'],
                    as: 'customer'
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        // 4. Final Response Structure (Jaisa aapne sketch kiya tha)
        const responseData = {
            meta: {
                sales_person: name,
                city: city,
                date: date,
                day_start_meter: dayInfo?.meter_reading || 'N/A'
            },
            report: visits.map(v => ({
                date: date,                       // 1st column
                customer_name: v.customer?.customer_name,
                area: v.customer?.area,
                type: v.customer?.type,
                visit_datetime: v.createdAt,      // Time for formatting
                status: v.is_completed ? 'OK' : '', 
                meter_reading: dayInfo?.meter_reading || 'N/A' // Last column
            }))
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('API Test Error:', error);
        res.status(500).json({ error: error.message });
    }
};