import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Startday = sequelize.define('Startday', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // refernce to user table
    },

    // Location Data (Flattened)
    location_latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    location_longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    location_timeStamp: { // Yeh original timeStamp hai
        type: DataTypes.DATE,
        allowNull: true
    },

    // Meter Readings Data
    startReading: { // Naam change kiya: 'meterReadings' se 'startReading'
        type: DataTypes.STRING,
        allowNull: true
    },

    // Photo URI/Path
    photoUri: {
        type: DataTypes.STRING,
        allowNull: true
    },


    // 🟢 Naye Columns Leave Handling ke liye
    is_leave: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // By default working day hoga
    },
    status: {
        type: DataTypes.ENUM('PRESENT', 'LEAVE'), // ENUM use karna best hai professional apps mein
        defaultValue: 'PRESENT'
    },
    leave_reason: { // Optional: Agar banda wajah likhna chahe
        type: DataTypes.STRING,
        allowNull: true
    }

});


export default Startday;





