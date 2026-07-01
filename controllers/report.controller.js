import Visits from "../models/visits.model.js";
import User from "../models/User.js";
import Startday from "../models/startday.model.js";
import Customers from "../models/customers.model.js";
import Designation from "../models/designations.model.js"
import City from "../models/City.js";
import { Op, fn, col } from "sequelize";
import { getDistanceInMeters } from '../utils/geoHelper.js'


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
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    // Support both standardized query formats safely
    const rawNames = req.query.names || req.query['names[]'];

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "From Date and To Date are required" });
    }

    let userWhereCondition = {};
    let isFilteredByNames = false;

    if (rawNames && rawNames !== "All" && rawNames !== "all" && rawNames !== 'All Users') {
      let namesArray = [];
      if (Array.isArray(rawNames)) {
        namesArray = rawNames;
      } else if (typeof rawNames === "string") {
        namesArray = rawNames.split(",").map(n => n.trim());
      }

      if (namesArray.length > 0 && !namesArray.includes('All')) {
        // Log ke mutabik dropdown field value database 'name' column se match karti hai
        userWhereCondition = { name: { [Op.in]: namesArray } };
        isFilteredByNames = true;
      }
    }

    // 2. Fetch target users execution execution stack
    const users = await User.findAll({
      where: userWhereCondition,
      include: [{ model: City, as: "cityDetails" }],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No matching users found in execution stack" });
    }

    const userMap = {};
    const userIds = users.map(u => {
      userMap[u.id] = u;
      return u.id;
    });

    const startRange = new Date(`${fromDate}T00:00:00.000Z`);
    const endRange = new Date(`${toDate}T23:59:59.999Z`);

    // 3. Concurrent thread allocation for optimization
    const [dayInfos, visits] = await Promise.all([
      Startday.findAll({
        where: {
          userId: { [Op.in]: userIds },
          createdAt: { [Op.between]: [startRange, endRange] },
        },
        attributes: [
          "userId", "startReading", "photoUri", "createdAt",
          "location_latitude", "location_longitude", "is_leave", "status",
        ],
      }),
      Visits.findAll({
        where: {
          user_id: { [Op.in]: userIds },
          createdAt: { [Op.between]: [startRange, endRange] },
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
      })
    ]);

    const dayInfoMap = new Map();
    dayInfos.forEach((d) => {
      const dDate = d.createdAt.toISOString().split("T")[0];
      dayInfoMap.set(`${d.userId}_${dDate}`, d);
    });

    let newVisits = 0;
    let matureVisits = 0;
    let oldVisits = 0;
    let newPotentialCustomerVisits = 0;

    // --- STEP 1: Process Flat Rows ---
    const flatData = visits.map((v) => {
      const visitDate = v.createdAt.toISOString().split("T")[0];
      const visitTime = v.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      if (v.purpose === "New") newVisits++;
      else if (v.purpose === "Mature") matureVisits++;
      else if (v.purpose === "Old") oldVisits++;
      else if (v.purpose === "NewPotentialCustomer") newPotentialCustomerVisits++;

      const dayReading = dayInfoMap.get(`${v.user_id}_${visitDate}`);
      const assignedUser = userMap[v.user_id];

      return {
        date: visitDate,
        sales_person: assignedUser ? assignedUser.fullname : "Unknown",
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
        is_leave: dayReading ? dayReading.is_leave : false,
        leave_status: dayReading?.is_leave ? (dayReading.status || "LEAVE") : "PRESENT",
        visit_location: { lat: v.latitude, lng: v.longitude },
        start_day_location: dayReading ? { lat: dayReading.location_latitude, lng: dayReading.location_longitude } : null,
      };
    });

    // --- STEP 2: Structural Grouping (Fix: Group by Date AND User to prevent reading overrides) ---
    const groupedReport = [];

    flatData.forEach((item) => {
      // Date aur Sales Person dono match hone chahiye unique group ke liye
      let existingGroup = groupedReport.find(
        (g) => g.date === item.date && g.sales_person === item.sales_person
      );

      if (existingGroup) {
        existingGroup.visits.push(item);
      } else {
        groupedReport.push({
          date: item.date,
          sales_person: item.sales_person, // Add identifier here
          meter_reading: item.start_meter_reading,
          photoUri: item.photoUri,
          start_location: item.start_day_location,
          start_time: item.start_day_time,
          is_leave: item.is_leave,
          leave_status: item.leave_status,
          visits: [item],
        });
      }
    });

    // --- STEP 3: Inject Day Start Artifacts for Empty Days ---
    dayInfos.forEach((day) => {
      const dDate = day.createdAt.toISOString().split("T")[0];
      const assignedUser = userMap[day.userId];
      const sPersonName = assignedUser ? assignedUser.fullname : "Unknown";

      // Match check both date and sales person context
      let existingGroup = groupedReport.find(
        (g) => g.date === dDate && g.sales_person === sPersonName
      );

      if (!existingGroup) {
        groupedReport.push({
          date: dDate,
          sales_person: sPersonName,
          meter_reading: day.startReading || "N/A",
          photoUri: day.photoUri || null,
          start_location: { lat: day.location_latitude, lng: day.location_longitude },
          start_time: day.createdAt.toISOString(),
          is_leave: day.is_leave,
          leave_status: day.is_leave ? (day.status || "LEAVE") : "PRESENT",
          visits: [],
        });
      }
    });

    groupedReport.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Fix conditional check using explicitly set flag 'isFilteredByNames'
    const selectedUsersMeta = isFilteredByNames
      ? users.map(u => u.fullname).join(", ")
      : "All Users";

    return res.status(200).json({
      meta: {
        selected_users: selectedUsersMeta,
        from_date: fromDate,
        to_date: toDate,
        total_visits: visits.length,
        new: newVisits,
        mature: matureVisits,
        old: oldVisits,
        newPotentialCustomer: newPotentialCustomerVisits,
      },
      report: groupedReport,
    });

  } catch (error) {
    console.error("API Error in Multi-Select Engine:", error);
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
    const { fromDate, toDate, region, userId } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "From Date and To Date are required" });
    }

    // --- 1. User Filter Configuration ---
    let userWhere = {};
    if (userId) userWhere.id = userId;
    if (region) userWhere.region = region;

    const allUsers = await User.findAll({
      where: userWhere,
      attributes: ["id", "fullname", "name", "region"],
    });

    // Hash Map for O(1) Lookup - Storing Name & Region
    const userMap = {};
    const validUserIds = allUsers.map(u => {
      userMap[u.id] = {
        name: u.fullname || u.name || "N/A",
        region: u.region || "N/A"
      };
      return u.id;
    });

    if (validUserIds.length === 0) {
      return res.status(200).json({ report: [], grand_summary: { total_sales_persons: 0 } });
    }

    // --- 2. Parallel Data Fetching ---
    const [dayInfos, visits] = await Promise.all([
      Startday.findAll({
        where: {
          userId: { [Op.in]: validUserIds },
          createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
        },
        attributes: ["id", "startReading", "createdAt", "userId", "is_leave", "status"],
      }),
      Visits.findAll({
        where: {
          user_id: { [Op.in]: validUserIds },
          createdAt: { [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`] },
        },
        attributes: ["id", "purpose", "createdAt", "user_id"],
      })
    ]);

    const dateGroups = {};

    // --- 3. Process Startday Data ---
    dayInfos.forEach((d) => {
      const date = d.createdAt.toISOString().split("T")[0];
      const uId = d.userId;
      if (!dateGroups[date]) dateGroups[date] = {};

      dateGroups[date][uId] = {
        sales_person: userMap[uId].name,
        region: userMap[uId].region, // Region added to response
        total_visits: 0,
        regular_visit: 0,
        followup_visit: 0,
        mature_order: 0,
        newPotentialCustomer_visit: 0,
        meter_reading: d.startReading || "N/A",
        status: d.status || (d.is_leave ? "LEAVE" : "PRESENT"),
      };
    });

    // --- 4. Process Visits (Corrected Mapping: Old=Followup, New=Regular) ---
    visits.forEach((v) => {
      const date = v.createdAt.toISOString().split("T")[0];
      const uId = v.user_id;

      if (!dateGroups[date]) dateGroups[date] = {};
      if (!dateGroups[date][uId]) {
        dateGroups[date][uId] = {
          sales_person: userMap[uId].name,
          region: userMap[uId].region,
          total_visits: 0,
          regular_visit: 0,
          followup_visit: 0,
          mature_order: 0,
          newPotentialCustomer_visit: 0,
          meter_reading: "N/A",
          status: "PRESENT"
        };
      }

      const row = dateGroups[date][uId];
      row.total_visits++;

      if (v.purpose === "Old") {
        row.followup_visit++; // Old = Followup
      } else if (v.purpose === "New") {
        row.regular_visit++;  // New = Regular
      } else if (v.purpose === "Mature") {
        row.mature_order++;
      } else if (v.purpose === "NewPotentialCustomer") {
        row.newPotentialCustomer_visit++;
      }
    });

    // --- 5. Final Formatting & Date Sorting ---
    const finalReport = [];
    let grandTotals = { total_visits: 0, total_regular: 0, total_followup: 0, total_mature: 0, total_newPotentialCustomer: 0 };
    const uniqueSalesPersons = new Set();

    Object.keys(dateGroups).sort().forEach((date) => {
      const personsData = Object.values(dateGroups[date]);
      let dSum = { visits: 0, reg: 0, fol: 0, mat: 0, npc: 0 };

      personsData.forEach(p => {
        dSum.visits += p.total_visits;
        dSum.reg += p.regular_visit;
        dSum.fol += p.followup_visit;
        dSum.mat += p.mature_order;
        dSum.npc += p.newPotentialCustomer_visit;
        uniqueSalesPersons.add(p.sales_person);
      });

      finalReport.push({
        visit_date: date,
        data: personsData,
        date_summary: dSum
      });

      grandTotals.total_visits += dSum.visits;
      grandTotals.total_regular += dSum.reg;
      grandTotals.total_followup += dSum.fol;
      grandTotals.total_mature += dSum.mat;
      grandTotals.total_newPotentialCustomer += dSum.npc;
    });

    return res.status(200).json({
      report: finalReport,
      grand_summary: {
        total_sales_persons: uniqueSalesPersons.size,
        ...grandTotals
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
    const allDates = [...new Set([
      ...dayInfos.map(d => d.createdAt.toISOString().split('T')[0]),
      ...visits.map(v => v.createdAt.toISOString().split('T')[0])
    ])].sort((a, b) => new Date(b) - new Date(a));

    allDates.forEach(date => {
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
        // In dono lines ko replace karo:
        is_leave: dayEntry ? (dayEntry.is_leave == 1 || dayEntry.is_leave == true) : false,
        status: dayEntry ? (dayEntry.is_leave ? "LEAVE" : (dayEntry.status || "PRESENT")) : "ABSENT",
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


export const generateMeterReadingReport = async (req, res) => {
  try {
    const { name, fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Name, From Date, and To Date are all required" });
    }

    // 1. User find karein (Full Name match karne ke liye)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { fullname: name },
          { name: name }
        ]
      },
      attributes: ["id", "fullname", "name"]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Startday table se readings fetch karein
    const readings = await Startday.findAll({
      where: {
        userId: user.id,
        createdAt: {
          [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
        },
      },
      attributes: ["createdAt", "startReading", "photoUri", "is_leave", "status"],
      order: [["createdAt", "DESC"]], // Latest dates pehle aayengi
    });

    // 3. Data ko format karein columns ke mutabiq
    const reportData = readings.map((r) => ({
      date: r.createdAt.toISOString().split("T")[0],
      user_fullname: user.fullname || user.name,
      meter_reading: r.is_leave ? "ON LEAVE" : (r.startReading || "N/A"),
      picture: r.photoUri || null, // Image URL ya path
      status: r.status || (r.is_leave ? "LEAVE" : "PRESENT")
    }));

    return res.status(200).json({
      success: true,
      meta: {
        total_records: reportData.length,
        filter_user: user.fullname,
        range: `${fromDate} to ${toDate}`
      },
      report: reportData
    });

  } catch (error) {
    console.error("Meter Reading Report Error:", error);
    res.status(500).json({ error: error.message });
  }
};




// Visit Verfication Report Function

export const generateVisitVerificationReport = async (req, res) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    // Support both standardized query formats safely to accommodate Axios array serialization
    const rawNames = req.query.names || req.query['names[]'];

    // 1. Structural Validation Target Check
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "From Date and To Date parameters are required" });
    }

    let userWhereCondition = {};
    let isFilteredByNames = false;

    if (rawNames && rawNames !== "All" && rawNames !== "all" && rawNames !== 'All Users') {
      let namesArray = [];
      if (Array.isArray(rawNames)) {
        namesArray = rawNames;
      } else if (typeof rawNames === "string") {
        namesArray = rawNames.split(",").map(n => n.trim());
      }

      if (namesArray.length > 0 && !namesArray.includes('All')) {
        // Dropdown identifier explicit target on 'name' key string metrics
        userWhereCondition = { name: { [Op.in]: namesArray } };
        isFilteredByNames = true;
      }
    }

    // 2. Fetch target users mapping matrix
    const users = await User.findAll({
      where: userWhereCondition,
      include: [{ model: City, as: "cityDetails", attributes: ["name"] }],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No matching target sales force users found in execution stack" });
    }

    // Allocate an O(1) space tracking object mapping database sequence identifiers
    const userMap = {};
    const userIds = users.map(u => {
      userMap[u.id] = u;
      return u.id;
    });

    // Isolate timestamps constraints strictly to timezone-neutral bounds
    const startRange = new Date(`${fromDate}T00:00:00.000Z`);
    const endRange = new Date(`${toDate}T23:59:59.999Z`);

    // 3. Extract Core Relational Matrices in Non-blocking Concurrent Threads
    const [dayInfos, visits] = await Promise.all([
      Startday.findAll({
        where: {
          userId: { [Op.in]: userIds },
          createdAt: { [Op.between]: [startRange, endRange] },
        },
        attributes: [
          "userId", "startReading", "photoUri", "createdAt",
          "location_latitude", "location_longitude", "is_leave", "status"
        ],
      }),
      Visits.findAll({
        where: {
          user_id: { [Op.in]: userIds },
          createdAt: { [Op.between]: [startRange, endRange] },
        },
        include: [
          {
            model: Customers,
            as: "customer",
            attributes: ["customer_name", "tehsil", "type", "bags_potential", "region", "latitude", "longitude"],
            include: [{ model: City, as: "cityDetails", attributes: ["name"] }]
          },
        ],
        order: [["createdAt", "ASC"]],
      })
    ]);

    // Fast-lookup mapping index strategy execution using composite operational keys
    const dayInfoMap = new Map();
    dayInfos.forEach((d) => {
      const dDate = d.createdAt.toISOString().split("T")[0];
      dayInfoMap.set(`${d.userId}_${dDate}`, d);
    });

    let verifiedCount = 0;
    let mismatchCount = 0;
    let unverifiedCount = 0;

    // --- STEP 1: Process and Verify Spatial Metric Logs ---
    const flatData = visits.map((v) => {
      const visitDate = v.createdAt.toISOString().split("T")[0];
      const visitTime = v.createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      const userLat = parseFloat(v.latitude);
      const userLng = parseFloat(v.longitude);
      const custLat = v.customer?.latitude ? parseFloat(v.customer.latitude) : null;
      const custLng = v.customer?.longitude ? parseFloat(v.customer.longitude) : null;

      // Distance optimization computation sequence execution
      const distanceInMeters = getDistanceInMeters(userLat, userLng, custLat, custLng);

      let verificationFlag = "Unverified";
      let distanceString = "N/A";

      if (distanceInMeters !== null && !isNaN(distanceInMeters)) {
        distanceString = `${distanceInMeters.toFixed(1)}m`;

        // Spatial geo-fencing constraint logic checks
        if (distanceInMeters <= 100) {
          verificationFlag = "Verified";
          verifiedCount++;
        } else {
          verificationFlag = "Location Mismatch";
          mismatchCount++;
        }
      } else {
        unverifiedCount++;
      }

      const dayReading = dayInfoMap.get(`${v.user_id}_${visitDate}`);
      const assignedUser = userMap[v.user_id];

      return {
        date: visitDate,
        sales_person: assignedUser ? assignedUser.fullname : "Unknown",
        visit_id: v.id,
        visit_time: visitTime,
        visit_purpose: v.purpose || "N/A",
        remarks: v.remarks || "",
        customer_name: v.customer?.customer_name || "N/A",
        city: v.customer?.cityDetails?.name || "N/A",
        type: v.customer?.type || "N/A",
        tehsil: v.customer?.tehsil || "N/A",
        bags_potential: v.customer?.bags_potential || 0,
        region: v.customer?.region || "N/A",

        user_coordinates: { lat: userLat, lng: userLng },
        customer_coordinates: { lat: custLat, lng: custLng },
        calculated_distance: distanceString,
        verification_status: verificationFlag,

        start_meter_reading: dayReading?.startReading || "N/A",
        photoUri: dayReading?.photoUri || null,
        is_leave: dayReading ? dayReading.is_leave : false,
        leave_status: dayReading?.is_leave ? (dayReading.status || "LEAVE") : "PRESENT"
      };
    });

    // --- STEP 2: Structural Grouping Logic (Composite Unique Constraints) ---
    const groupedReport = [];

    flatData.forEach((item) => {
      // Group targeting enforces absolute grouping isolation by both Date AND Sales Person name parameters
      let existingGroup = groupedReport.find(
        (g) => g.date === item.date && g.sales_person === item.sales_person
      );

      if (existingGroup) {
        existingGroup.visits.push(item);
      } else {
        groupedReport.push({
          date: item.date,
          sales_person: item.sales_person,
          meter_reading: item.start_meter_reading,
          photoUri: item.photoUri,
          is_leave: item.is_leave,
          leave_status: item.leave_status,
          visits: [item],
        });
      }
    });

    // --- STEP 3: Inject Empty Day States (Leaves / Present logs without field entries) ---
    dayInfos.forEach((day) => {
      const dDate = day.createdAt.toISOString().split("T")[0];
      const assignedUser = userMap[day.userId];
      const sPersonName = assignedUser ? assignedUser.fullname : "Unknown";

      let existingGroup = groupedReport.find(
        (g) => g.date === dDate && g.sales_person === sPersonName
      );

      if (!existingGroup) {
        groupedReport.push({
          date: dDate,
          sales_person: sPersonName,
          meter_reading: day.startReading || "N/A",
          photoUri: day.photoUri || null,
          is_leave: day.is_leave,
          leave_status: day.is_leave ? (day.status || "LEAVE") : "PRESENT",
          visits: [], // Structural interface safety array map preservation
        });
      }
    });

    groupedReport.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Evaluate conditional metrics definitions string allocations safely
    const selectedUsersMeta = isFilteredByNames
      ? users.map(u => u.fullname).join(", ")
      : "All Users";

    // 5. Structure Output Data Payload standard specifications
    return res.status(200).json({
      meta: {
        selected_users: selectedUsersMeta,
        filter_period: { from: fromDate, to: toDate },
        metrics: {
          total_visits: visits.length,
          verified_visits: verifiedCount,
          location_mismatch_visits: mismatchCount,
          unverified_missing_coords: unverifiedCount
        }
      },
      report: groupedReport,
    });

  } catch (error) {
    console.error("Critical Failure in Security Spatial Verification Controller:", error);
    return res.status(500).json({ error: "Internal Server System Error", details: error.message });
  }
};


// VISIT COUNT REPORT
export const getVisitCountReport = async (req, res) => {
  try {
    const { names, fromDate, toDate } = req.query;

    // 1. Base Criteria for Date Boundaries
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Missing mandatory fields: fromDate and toDate are required."
      });
    }

    const visitWhereClause = {
      date: {
        [Op.between]: [fromDate, toDate]
      }
    };

    // 2. Dynamic Scope Resolution for User Filters
    if (names && names !== 'All') {
      // Frontend se agar comma-separated string aye (e.g., "hafiz.zia,ali.raza") to use array banayein
      const parsedNames = typeof names === 'string' ? names.split(',') : (Array.isArray(names) ? names : [names]);

      if (parsedNames.length > 0 && !parsedNames.includes('all_users')) {
        const resolvedUsers = await User.findAll({
          where: { name: { [Op.in]: parsedNames } },
          attributes: ['id'],
          raw: true
        });

        const userIds = resolvedUsers.map(u => u.id);
        visitWhereClause.user_id = { [Op.in]: userIds };
      }
    }


    // 3. High Performance Aggregation Layer
    const reportMetrics = await Visits.findAll({
      where: visitWhereClause,
      attributes: [
        'user_id',
        'customer_id',
        [fn('COUNT', col('Visits.id')), 'visit_count'],
        [fn('MAX', col('date')), 'last_visit_date']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'fullname', 'designationId'],
          include: [
            {
              model: Designation,
              as: 'designationDetails',
              attributes: ['id', 'designation'] // CRITICAL: Tumhare model mein 'name' nahi, column ka naam 'designation' hai
            }
          ]
        },
        {
          model: Customers,
          as: 'customer',
          attributes: ['id', 'customer_name', 'tehsil', 'area', 'type']
        },
      ],
      group: [
        'Visits.user_id',
        'Visits.customer_id',
        'user.id',
        // FIXED: Explicit nested model hierarchy array representation
        'user.designationDetails.id',
        'customer.id'
      ],
      order: [[fn('COUNT', col('Visits.id')), 'DESC']],
    });

    // 4. Data Sanitization & Formatting
    const formattedReport = reportMetrics.map(metric => {
      const row = metric.get({ plain: true });
      return {
        sales_person: row.user?.fullname || row.user?.name || "N/A",
        // FIXED: Accurate navigation pathway based on your association mapping
        designation: row.user?.designationDetails?.designation || "N/A",
        customer_name: row.customer?.customer_name || "N/A",
        tehsil: row.customer?.tehsil || "N/A",
        area: row.customer?.area || "N/A",
        customer_type: row.customer?.type || "N/A",
        visit_count: parseInt(row.visit_count, 10) || 0,
        last_visit: row.last_visit_date || "N/A"
      };
    });

    return res.status(200).json({
      success: true,
      total_records: formattedReport.length,
      report: formattedReport
    });

  } catch (error) {
    console.error("CRITICAL ERROR IN VISIT COUNT REPORT:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error execution failing inside calculation blocks.",
      error: error.message
    });
  }
};