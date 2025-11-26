import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Startday = sequelize.define('Startday',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        // refernce to user table
    },

    // Location Data (Flattened)
    location_latitude: {
        type: DataTypes.FLOAT, 
        allowNull: false
    },
    location_longitude: {
        type: DataTypes.FLOAT, 
        allowNull: false
    },
    location_timeStamp: { // Yeh original timeStamp hai
        type: DataTypes.DATE, 
        allowNull: false
    },

    // Meter Readings Data
    startReading: { // Naam change kiya: 'meterReadings' se 'startReading'
        type: DataTypes.STRING, 
        allowNull: false
    },

    // Photo URI/Path
    photoUri: {
        type: DataTypes.STRING, 
        allowNull: true 
    }
    
});


export default Startday;





