import Visits from "../models/visits.model.js";
import User from "../models/User.js";
import Startday from "../models/startday.model.js";
import Customers from "../models/customers.model.js";
import City from "../models/City.js";
import { Op } from "sequelize";

// export const generateDailyVisitReport = async (req, res) => {
//   try {
//     const { name, fromDate, toDate } = req.query;

//     if (!name || !fromDate || !toDate) {
//       return res
//         .status(400)
//         .json({ error: "Name, From Date, and To Date are all required" });
//     }

//     // 1. User aur City details fetch karein
//     const user = await User.findOne({
//       where: { name: name },
//       include: [
//         {
//           model: City,
//           as: "cityDetails",
//         },
//       ],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user_id = user.id;
//     const designation = user.designation;
//     const fullname = user.fullname;
//     const userCity = user.cityDetails?.name || "N/A";

//     // 2. Startday table se Meter Readings fetch karein
//     const dayInfos = await Startday.findAll({
//       where: {
//         userId: user_id,
//         createdAt: {
//           [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
//         },
//       },
//       attributes: [
//         "startReading",
//         "photoUri",
//         "createdAt",
//         "location_latitude",
//         "location_longitude",
//       ],
//     });

//     // 3. Visits aur Customer details fetch karein
//     const visits = await Visits.findAll({
//       where: {
//         user_id: user_id,
//         createdAt: {
//           [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
//         },
//       },
//       include: [
//         {
//           model: Customers,
//           attributes: ["customer_name", "tehsil", "type", "bags_potential", "region"],
//           as: "customer",
//           // ðŸš€ Yeh nested include missing tha, jiski wajah se 'name' undefined ho raha tha
//           include: [
//             {
//               model: City,
//               as: "cityDetails",
//               attributes: ["name"],
//             }
//           ]
//         },

//       ],
//       order: [["createdAt", "ASC"]],
//     });


//     // --- ðŸŸ¢ COUNTERS (Based on Visit Purpose) ---
//     let newVisits = 0;
//     let matureVisits = 0;
//     let oldVisits = 0;

//     // --- ðŸŸ¢ STEP 1: Pehle flat data map karein ---
//     const flatData = visits.map((v) => {
//       const visitDate = v.createdAt.toISOString().split("T")[0];

//       // Visit ka exact time (e.g., 10:30 AM) nikalne ke liye
//       const visitTime = v.createdAt.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//       const visitPurpose = v.purpose;

//       if (visitPurpose === "New") newVisits++;
//       else if (visitPurpose === "Mature") matureVisits++;
//       else if (visitPurpose === "Old") oldVisits++;


//       const dayReading = dayInfos.find(
//         (d) => d.createdAt.toISOString().split("T")[0] === visitDate
//       );

//       return {
//         date: visitDate,
//         createdAt: v.createdAt, // Original timestamp for sorting if needed
//         visit_time: visitTime,  // ðŸ‘ˆ Yeh field frontend par dikhane ke liye
//         visit_purpose: visitPurpose,
//         customer_name: v.customer?.customer_name || "N/A",
//         city: v.customer?.cityDetails?.name || "N/A",
//         type: v.customer?.type || "N/A",
//         tehsil: v.customer?.tehsil || "N/A",
//         bags_potential: v.customer?.bags_potential || "N/A",
//         region: v.customer?.region || "N/A",
//         status: v.is_completed ? "OK" : "Yes",
//         start_meter_reading: dayReading?.startReading || "N/A",
//         start_day_time: dayReading ? dayReading.createdAt.toISOString() : null,
//         photoUri: dayReading?.photoUri || null, //
//         visit_location: { lat: v.latitude, lng: v.longitude },
//         start_day_location: dayReading
//           ? {
//             lat: dayReading.location_latitude,
//             lng: dayReading.location_longitude,
//           }
//           : null,
//       };
//     });

//     // --- ðŸŸ¢ STEP 2: Ab Data ko GROUP karein (RowSpan ke liye zaroori) ---
//     const groupedReport = [];
//     flatData.forEach((item) => {
//       // Check karein kya is date ka group pehle se hai?
//       let existingGroup = groupedReport.find((g) => g.date === item.date);

//       if (existingGroup) {
//         // Agar date match ho gayi, toh sirf visit add karein
//         existingGroup.visits.push(item);
//       } else {
//         // Agar nayi date hai, toh naya group banayein
//         groupedReport.push({
//           date: item.date,
//           meter_reading: item.start_meter_reading, // Common Meter Reading
//           photoUri: item.photoUri, //common photo
//           start_location: item.start_day_location, // common start location
//           start_time: item.start_day_time, // common start time
//           visits: [item], // Is din ki pehli visit
//         });
//       }
//     });

//     // 4. Final Organized Response
//     const responseData = {
//       meta: {
//         sales_person: fullname,
//         region: user.region || "N/A",
//         from_date: fromDate,
//         to_date: toDate,
//         total_visits: visits.length,
//         new: newVisits,
//         mature: matureVisits,
//         old: oldVisits,
//         designation: designation,
//       },
//       report: groupedReport,
//     };

//     return res.status(200).json(responseData);
//   } catch (error) {
//     console.error("API Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const generateDailyVisitReport = async (req, res) => {
  try {
    const { name, fromDate, toDate } = req.query;

    if (!name || !fromDate || !toDate) {
      return res.status(400).json({ error: "Name, From Date, and To Date are all required" });
    }

    // 1. User aur City details (Original Code)
    const user = await User.findOne({
      where: { name: name },
      include: [{ model: City, as: "cityDetails" }],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const user_id = user.id;
    const designation = user.designation;
    const fullname = user.fullname;

    // 2. Startday table (Added is_leave and status columns)
    const dayInfos = await Startday.findAll({
      where: {
        userId: user_id,
        createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
      },
      attributes: [
        "startReading",
        "photoUri",
        "createdAt",
        "location_latitude",
        "location_longitude",
        "is_leave", // 🆕 Leave support
        "status",   // 🆕 Leave reason/status
      ],
    });

    // 3. Visits (Original Code)
    const visits = await Visits.findAll({
      where: {
        user_id: user_id,
        createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
      },
      include: [
        {
          model: Customers,
          attributes: ["customer_name", "tehsil", "type", "bags_potential", "region"],
          as: "customer",
          include: [{ model: City, as: "cityDetails", attributes: ["name"] }]
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    let newVisits = 0;
    let matureVisits = 0;
    let oldVisits = 0;

    // --- STEP 1: Pehle flat data map karein (As per your old logic) ---
    const flatData = visits.map((v) => {
      const visitDate = v.createdAt.toISOString().split("T")[0];
      const visitTime = v.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      if (v.purpose === "New") newVisits++;
      else if (v.purpose === "Mature") matureVisits++;
      else if (v.purpose === "Old") oldVisits++;

      const dayReading = dayInfos.find((d) => d.createdAt.toISOString().split("T")[0] === visitDate);

      return {
        date: visitDate,
        createdAt: v.createdAt,
        visit_time: visitTime,
        visit_purpose: v.purpose,
        customer_name: v.customer?.customer_name || "N/A",
        city: v.customer?.cityDetails?.name || "N/A",
        type: v.customer?.type || "N/A",
        tehsil: v.customer?.tehsil || "N/A",
        bags_potential: v.customer?.bags_potential || "N/A",
        region: v.customer?.region || "N/A",
        status: v.is_completed ? "OK" : "Yes",
        start_meter_reading: dayReading?.startReading || "N/A",
        start_day_time: dayReading ? dayReading.createdAt.toISOString() : null,
        photoUri: dayReading?.photoUri || null,
        is_leave: dayReading?.is_leave || false, // 🆕 Integration
        leave_status: dayReading?.is_leave ? (dayReading.status || "LEAVE") : "PRESENT", // 🆕 Integration
        visit_location: { lat: v.latitude, lng: v.longitude },
        start_day_location: dayReading ? { lat: dayReading.location_latitude, lng: dayReading.location_longitude } : null,
      };
    });

    // --- STEP 2: Grouping Logic (Keeping it 100% same structure) ---
    const groupedReport = [];

    // Pehle visits se data bharo (Aapka original loop)
    flatData.forEach((item) => {
      let existingGroup = groupedReport.find((g) => g.date === item.date);
      if (existingGroup) {
        existingGroup.visits.push(item);
      } else {
        groupedReport.push({
          date: item.date,
          meter_reading: item.start_meter_reading,
          photoUri: item.photoUri,
          start_location: item.start_day_location,
          start_time: item.start_day_time,
          is_leave: item.is_leave,       // 🆕 Portal use kar sakta hai
          leave_status: item.leave_status, // 🆕 Portal use kar sakta hai
          visits: [item],
        });
      }
    });

    // 🆕 CRITICAL FIX: Wo din bhi add karein jin par sirf LEAVE thi par koi VISIT nahi thi
    dayInfos.forEach((day) => {
      const dDate = day.createdAt.toISOString().split("T")[0];
      let existingGroup = groupedReport.find((g) => g.date === dDate);

      if (!existingGroup && day.is_leave) {
        groupedReport.push({
          date: dDate,
          meter_reading: day.startReading || "N/A",
          photoUri: day.photoUri || null,
          start_location: { lat: day.location_latitude, lng: day.location_longitude },
          start_time: day.createdAt.toISOString(),
          is_leave: true,
          leave_status: day.status || "LEAVE",
          visits: [], // Empty visits taake portal crash na ho
        });
      }
    });

    // Dates sort karein (Latest first)
    groupedReport.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Response
    return res.status(200).json({
      meta: {
        sales_person: fullname,
        region: user.region || "N/A",
        from_date: fromDate,
        to_date: toDate,
        total_visits: visits.length,
        new: newVisits,
        mature: matureVisits,
        old: oldVisits,
        designation: designation,
      },
      report: groupedReport,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
};



// export const generateSummaryReport = async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({ error: "From Date and To Date are required" });
//     }

//     // 1. Saare Users fetch karein
//     const allUsers = await User.findAll({
//       attributes: ["id", "fullname", "name"],
//     });

//     // 2. Visits fetch karein (Aapne bataya yahan 'user_id' hai)
//     const visits = await Visits.findAll({
//       where: {
//         createdAt: {
//           [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
//         },
//       },
//       attributes: ["id", "purpose", "createdAt", "user_id"], // ðŸ‘ˆ user_id confirmed
//     });

//     // 3. Startday fetch karein (Image ke mutabiq yahan 'userId' hai)
//     const dayInfos = await Startday.findAll({
//       where: {
//         createdAt: {
//           [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
//         },
//       },
//       attributes: ["id", "startReading", "createdAt", "userId"], // ðŸ‘ˆ userId confirmed
//     });

//     const dateGroups = {};

//     // --- LOGIC: Startday (Meter Readings) Map karein ---
//     dayInfos.forEach((d) => {
//       const date = d.createdAt.toISOString().split("T")[0];
//       const uId = d.userId; // Startday wala column

//       const userObj = allUsers.find(u => u.id === uId);
//       const userName = userObj?.fullname || userObj?.name || "N/A";

//       if (!dateGroups[date]) dateGroups[date] = {};

//       dateGroups[date][uId] = {
//         sales_person: userName,
//         total_visits: 0,
//         regular_visit: 0,
//         followup_visit: 0,
//         mature_order: 0,
//         meter_reading: d.startReading || "N/A",
//       };
//     });

//     // --- LOGIC: Visits ka data map mein add karein ---
//     visits.forEach((v) => {
//       const date = v.createdAt.toISOString().split("T")[0];
//       const uId = v.user_id; // Visits wala column

//       if (!dateGroups[date]) dateGroups[date] = {};
//       if (!dateGroups[date][uId]) {
//         const userObj = allUsers.find(u => u.id === uId);
//         dateGroups[date][uId] = {
//           sales_person: userObj?.fullname || userObj?.name || "N/A",
//           total_visits: 0,
//           regular_visit: 0,
//           followup_visit: 0,
//           mature_order: 0,
//           meter_reading: "N/A",
//         };
//       }

//       const row = dateGroups[date][uId];
//       row.total_visits++;

//       if (v.purpose === "Old") row.regular_visit++;
//       else if (v.purpose === "New") row.followup_visit++;
//       else if (v.purpose === "Mature") row.mature_order++;
//     });

//     // --- STEP 3: Formatting & Summation (Excel Style) ---
//     const finalReport = [];
//     let grandVisits = 0, grandReg = 0, grandFol = 0, grandMat = 0;
//     const uniqueSalesPersons = new Set();

//     Object.keys(dateGroups).sort().forEach((date) => {
//       const personsData = Object.values(dateGroups[date]);
//       let dVisits = 0, dReg = 0, dFol = 0, dMat = 0;

//       personsData.forEach(p => {
//         dVisits += p.total_visits;
//         dReg += p.regular_visit;
//         dFol += p.followup_visit;
//         dMat += p.mature_order;
//         uniqueSalesPersons.add(p.sales_person);
//       });

//       finalReport.push({
//         visit_date: date,
//         data: personsData,
//         date_summary: {
//           total_persons: personsData.length,
//           total_visits: dVisits,
//           regular: dReg,
//           followup: dFol,
//           mature: dMat
//         }
//       });

//       grandVisits += dVisits; grandReg += dReg; grandFol += dFol; grandMat += dMat;
//     });

//     return res.status(200).json({
//       report: finalReport,
//       grand_summary: {
//         total_sales_persons: uniqueSalesPersons.size,
//         total_visits: grandVisits,
//         total_regular: grandReg,
//         total_followup: grandFol,
//         total_mature: grandMat
//       }
//     });

//   } catch (error) {
//     console.error("Summary API Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };





// Isko controller file mein add karein



export const generateSummaryReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "From Date and To Date are required" });
    }

    // 1. Users Fetch
    const allUsers = await User.findAll({
      attributes: ["id", "fullname", "name"],
    });

    // 2. Startday Fetch (Using 'status' column instead of leave_status)
    const dayInfos = await Startday.findAll({
      where: {
        createdAt: {
          [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
        },
      },
      // attributes mein 'status' use kiya hai
      attributes: ["id", "startReading", "createdAt", "userId", "is_leave", "status"],
    });

    // 3. Visits Fetch
    const visits = await Visits.findAll({
      where: {
        createdAt: {
          [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
        },
      },
      attributes: ["id", "purpose", "createdAt", "user_id"],
    });

    const dateGroups = {};

    // --- LOGIC: Startday Mapping ---
    dayInfos.forEach((d) => {
      const date = d.createdAt.toISOString().split("T")[0];
      const uId = d.userId;

      const userObj = allUsers.find(u => u.id === uId);
      const userName = userObj?.fullname || userObj?.name || "N/A";

      if (!dateGroups[date]) dateGroups[date] = {};

      dateGroups[date][uId] = {
        sales_person: userName,
        total_visits: 0,
        regular_visit: 0,
        followup_visit: 0,
        mature_order: 0,
        meter_reading: d.startReading || "N/A",
        // 'status' column mapping
        is_leave: d.is_leave || false,
        status: d.status || (d.is_leave ? "LEAVE" : "PRESENT"),
      };
    });

    // --- LOGIC: Visits Mapping ---
    visits.forEach((v) => {
      const date = v.createdAt.toISOString().split("T")[0];
      const uId = v.user_id;

      if (!dateGroups[date]) dateGroups[date] = {};
      if (!dateGroups[date][uId]) {
        const userObj = allUsers.find(u => u.id === uId);
        dateGroups[date][uId] = {
          sales_person: userObj?.fullname || userObj?.name || "N/A",
          total_visits: 0,
          regular_visit: 0,
          followup_visit: 0,
          mature_order: 0,
          meter_reading: "N/A",
          is_leave: false,
          status: "PRESENT"
        };
      }

      const row = dateGroups[date][uId];
      row.total_visits++;

      if (v.purpose === "Old") row.regular_visit++;
      else if (v.purpose === "New") row.followup_visit++;
      else if (v.purpose === "Mature") row.mature_order++;
    });

    // --- Final Formatting ---
    const finalReport = [];
    let grandVisits = 0, grandReg = 0, grandFol = 0, grandMat = 0;
    const uniqueSalesPersons = new Set();

    Object.keys(dateGroups).sort().forEach((date) => {
      const personsData = Object.values(dateGroups[date]);
      let dVisits = 0, dReg = 0, dFol = 0, dMat = 0;

      personsData.forEach(p => {
        dVisits += p.total_visits;
        dReg += p.regular_visit;
        dFol += p.followup_visit;
        dMat += p.mature_order;
        uniqueSalesPersons.add(p.sales_person);
      });

      finalReport.push({
        visit_date: date,
        data: personsData,
        date_summary: {
          total_persons: personsData.length,
          total_visits: dVisits,
          regular: dReg,
          followup: dFol,
          mature: dMat
        }
      });

      grandVisits += dVisits; grandReg += dReg; grandFol += dFol; grandMat += dMat;
    });

    return res.status(200).json({
      report: finalReport,
      grand_summary: {
        total_sales_persons: uniqueSalesPersons.size,
        total_visits: grandVisits,
        total_regular: grandReg,
        total_followup: grandFol,
        total_mature: grandMat
      }
    });

  } catch (error) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: error.message });
  }
};



export const generateMyReport = async (req, res) => {
  try {
    // 🚨 Authentication middleware se userId aye gi (req.user.id)
    // Query se sirf dates lenge
    const { fromDate, toDate, targetUserId } = req.query;
    const user_id = targetUserId || req.user.id; // Login bande ki ID ya target id

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "From Date and To Date are required" });
    }

    // 1. User ki basic info (for header)
    const user = await User.findByPk(user_id, {
      attributes: ['fullname', 'designation', 'region']
    });

    // 2. Startday Info (Meter Readings)
    const dayInfos = await Startday.findAll({
      where: {
        userId: user_id, // Database mein 'userId' hai
        createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
      },
      // 👈 Attributes specify kar diye taake faltu 'user_id' na mangwaye
      attributes: [
        "id",
        "userId",
        "startReading",
        "photoUri",
        "is_leave",
        "status",
        "createdAt",
        "location_latitude",
        "location_longitude"
      ],
    });

    // 3. Visits with Customers & City Details
    const visits = await Visits.findAll({
      where: {
        user_id: user_id, // Database mein 'user_id' hai
        createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
      },
      // 👈 Idhar bhi attributes lock kar diye panga khatam karne ke liye
      attributes: ["id", "user_id", "customer_id", "purpose", "createdAt", "latitude", "longitude"],
      include: [
        {
          model: Customers,
          as: "customer",
          attributes: ["customer_name", "type", "bags_potential"],
          include: [{ model: City, as: "cityDetails", attributes: ["name"] }]
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // --- STEP: Grouping Logic (Mobile Layout ke liye) ---
    const groupedReport = [];

    // Saari unique dates nikalne ke liye
    const dates = [...new Set(visits.map(v => v.createdAt.toISOString().split('T')[0]))];

    dates.forEach(date => {
      // Is din ki meter reading dhoondo
      const dayEntry = dayInfos.find(d => d.createdAt.toISOString().split('T')[0] === date);

      // Is din ki saari visits filter karo
      const dayVisits = visits.filter(v => v.createdAt.toISOString().split('T')[0] === date).map(v => ({
        time: v.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: v.customer?.type || "N/A",
        purpose: v.purpose || "Regular",
        customer_name: v.customer?.customer_name || "N/A",
        city: v.customer?.cityDetails?.name || "N/A",
        bags: v.customer?.bags_potential || 0
      }));

      groupedReport.push({
        date: date,
        day_start_time: dayEntry ? dayEntry.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A",
        meter_reading: dayEntry?.startReading || "N/A",
        is_leave: dayEntry?.is_leave || false,
        status: dayEntry?.status || "PRESENT",
        activities: dayVisits
      });
    });

    return res.status(200).json({
      success: true,
      meta: {
        name: user?.fullname,
        designation: user?.designation,
        region: user?.region
      },
      report: groupedReport
    });

  } catch (error) {
    console.error("My Report API Error:", error);
    res.status(500).json({ error: error.message });
  }
};
