//model imports 
import User from '../models/User.js';
import Startday from '../models/startday.model.js';
import Visits from '../models/visits.model.js';

// sequilize functions import 
import {Op} from 'sequelize';
import {Sequelize} from 'sequelize';

// csv file import 

import { Parser } from 'json2csv';

export const generateReport = async (req , res) => {
    try {
        const {start , end , user_id} = req.query;

        if(!start && !end){
            return res.status(400).json("Start date and end date is required");

        }


        const dateRangeFilter = {
            createdAt:{ [Op.between] : [new Date(start) , new Date(end)]}
        };


        // Agar user_id filter mein aaya hai
        if (user_id && user_id !== 'all') { 
            // Visits table ke liye filter
            dateRangeFilter.user_id = user_id; 
        }


        
        // data fetching and aggregations.
        const visitsSummary = await Visits.findAll({
            // attributtes define
            attributes:[
                'user_id',
                [Sequelize.fn('DATE' , Sequelize.col('createdAt')) , 'activity_date'],
                [Sequelize.fn('COUNT' , Sequelize.col('id')) , 'total_visits'],
                [Sequelize.fn('COUNT' , Sequelize.fn('DISTINCT' , Sequelize.col('customer_id'))) , 'unique_customers']
            ],
            where:dateRangeFilter,
            group:['activity_date' , 'user_id'],
            raw:true
        });


        // start day colomn
        const startdayFilter = {
            createdAt : dateRangeFilter.createdAt
        };

        if(user_id && user_id !== 'all'){
            startdayFilter.userId = user_id; // start day main userId colomn hai
        }

        const startdaySummary = await Startday.findAll({

            // start time nikalana
            attributes:[
                'userId',
                [Sequelize.fn('DATE' , Sequelize.col('createdAt')) , 'activity_date'],
                [Sequelize.fn('MIN' , Sequelize.col('createdAt')) , 'day_start_time']
            ],
            where:startdayFilter,
            group:['activity_date' , 'userId'],
            raw:true
        })


        // step 5 Map main Visits ka data key value pairs main dalna 

        // Mini-Step 5.A.i: Map banana
        const combinedDataMap = new Map();

        // Visits data ko Map mein daalna
        visitsSummary.forEach(item => {
            const key = `${item.activity_date}-${item.user_id}`;
            combinedDataMap.set(key, {
                Date: item.activity_date,
                AgentID: item.user_id,
                TotalVisits: item.total_visits,
                UniqueCustomers: item.unique_customers,
                DayStartTime: 'N/A' // Placeholder for start time
            });
        });


        // Startday data se combine karna
        startdaySummary.forEach(item => {
            const key = `${item.activity_date}-${item.userId}`;
            const startTime = new Date(item.day_start_time).toLocaleTimeString(); // Time ko achhe format mein badalna

            if (combinedDataMap.has(key)) {
                // Agar visit bhi ki aur startday bhi kiya
                combinedDataMap.get(key).DayStartTime = startTime;
            } else {
                // Agar sirf startday kiya (attendance lagai) par visit nahi ki
                combinedDataMap.set(key, {
                    Date: item.activity_date,
                    AgentID: item.userId,
                    TotalVisits: 0,
                    UniqueCustomers: 0,
                    DayStartTime: startTime
                });
            }
        });


        // Mini-Step 5.A.ii: Final Array banana
        const finalReportData = Array.from(combinedDataMap.values());

        if (finalReportData.length === 0) {
                 return res.status(200).send("Report generated successfully, but no activity data found for the selected dates and agent.");
                                  }

        console.log("final report ..........." , finalReportData);

        // csv file banana

        // Mini-Step 5.B.i: JSON to CSV
        const fields = ['Date', 'AgentID', 'TotalVisits', 'UniqueCustomers', 'DayStartTime'];

       // Yahan fields option add kiya
        const json2csvParser = new Parser({ fields: fields }); 
        const csv = json2csvParser.parse(finalReportData);

        // Mini-Step 5.B.ii & 5.B.iii: Headers set karna aur file bhejna
        res.header('Content-Type', 'text/csv');
        res.attachment(`Field_Activity_Report_${start}_to_${end}.csv`);
        
        res.send(csv); // CSV file download shuru ho jayegi



    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).send({ 
            message: "Report not generated...",
            error: error.message
        });
    }
}