import User from "../models/User.js";
import Customers from "../models/customers.model.js";
import Visits from "../models/visits.model.js";
import { Op } from 'sequelize';


export const kpis = async (req , res) =>{
    try {
        const totalUsers = await User.count();
        console.log(totalUsers);

        const totalVisits = await Visits.count();
        console.log(totalVisits);


        const totalCustomers = await Customers.count();
        console.log(totalCustomers);


        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = await User.count({
            where: {
                // Sahi column ka naam use ho raha hai
                last_login: { [Op.gte]: thirtyDaysAgo } 
            }
        });




        res.status(200).json({
            status : "success",
            data : {
                totalCustomers,
                totalUsers,
                totalVisits,
                activeUsers
            }
        })

    } catch (error) {
        
    }
}



