import Visits from "../models/visits.model.js";
import User from "../models/User.js";
import Startday from "../models/startday.model.js";
import Customers from "../models/customers.model.js";
import City from "../models/City.js";
import { Op } from "sequelize";

export const generateDailyVisitReport = async (req, res) => {
  try {
    const { name, fromDate, toDate } = req.query;

    if (!name || !fromDate || !toDate) {
      return res
        .status(400)
        .json({ error: "Name, From Date, and To Date are all required" });
    }

    // 1. User aur City details fetch karein
    const user = await User.findOne({
      where: { name: name },
      include: [
        {
          model: City,
          as: "cityDetails",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const user_id = user.id;
    const designation = user.designation;
    const fullname = user.fullname;
    const userCity = user.cityDetails?.name || "N/A";

    // 2. Startday table se Meter Readings fetch karein
    const dayInfos = await Startday.findAll({
      where: {
        userId: user_id,
        createdAt: {
          [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
        },
      },
      attributes: [
        "startReading",
        "photoUri",
        "createdAt",
        "location_latitude",
        "location_longitude",
      ],
    });

    // 3. Visits aur Customer details fetch karein
    const visits = await Visits.findAll({
      where: {
        user_id: user_id,
        createdAt: {
          [Op.between]: [`${fromDate} 00:00:00`, `${toDate} 23:59:59`],
        },
      },
      include: [
        {
          model: Customers,
          attributes: ["customer_name", "area", "type" , "bags_potential"],
          as: "customer",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // --- 🟢 STEP 1: Pehle flat data map karein ---
    const flatData = visits.map((v) => {
      const visitDate = v.createdAt.toISOString().split("T")[0];

      // Visit ka exact time (e.g., 10:30 AM) nikalne ke liye
      const visitTime = v.createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });


      const dayReading = dayInfos.find(
        (d) => d.createdAt.toISOString().split("T")[0] === visitDate
      );

      return {
        date: visitDate,
        createdAt: v.createdAt, // Original timestamp for sorting if needed
        visit_time: visitTime,  // 👈 Yeh field frontend par dikhane ke liye
        customer_name: v.customer?.customer_name || "N/A",
        area: v.customer?.area || "N/A",
        type: v.customer?.type || "N/A",
        bags_potential: v.customer?.bags_potential || "N/A",
        status: v.is_completed ? "OK" : "Yes",
        start_meter_reading: dayReading?.startReading || "N/A",
        start_day_time: dayReading ? dayReading.createdAt.toISOString() : null,
        photoUri: dayReading?.photoUri || null, //
        visit_location: { lat: v.latitude, lng: v.longitude },
        start_day_location: dayReading
          ? {
              lat: dayReading.location_latitude,
              lng: dayReading.location_longitude,
            }
          : null,
      };
    });

    // --- 🟢 STEP 2: Ab Data ko GROUP karein (RowSpan ke liye zaroori) ---
    const groupedReport = [];
    flatData.forEach((item) => {
      // Check karein kya is date ka group pehle se hai?
      let existingGroup = groupedReport.find((g) => g.date === item.date);

      if (existingGroup) {
        // Agar date match ho gayi, toh sirf visit add karein
        existingGroup.visits.push(item);
      } else {
        // Agar nayi date hai, toh naya group banayein
        groupedReport.push({
          date: item.date,
          meter_reading: item.start_meter_reading, // Common Meter Reading
          photoUri: item.photoUri, //common photo
          start_location: item.start_day_location, // common start location
          start_time: item.start_day_time, // common start time
          visits: [item], // Is din ki pehli visit
        });
      }
    });

    // 4. Final Organized Response
    const responseData = {
      meta: {
        sales_person: fullname,
        city: userCity,
        from_date: fromDate,
        to_date: toDate,
        total_visits: visits.length,
        designation: designation,
      },
      report: groupedReport,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
};
