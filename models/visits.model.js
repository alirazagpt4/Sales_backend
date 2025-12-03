import { DataTypes } from 'sequelize'; 

import sequelize from "../config/db.js"; 


const Visits = sequelize.define('Visits', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    
    // --- Linking Fields (Foreign Keys) ---
    
    customer_id: {
        type: DataTypes.STRING, // Ensure this matches the type of Customer's primary key (STRING)
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER, // Ensure this matches the type of User's primary key
        allowNull: false,
    },

    // --- Core Visit Data ---
    
    // Location Data
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    
    // Purpose and Type
    purpose: {
        type: DataTypes.ENUM('Visit', 'Mature'),
        allowNull: false,
    },
    date: { 
        type: DataTypes.DATEONLY, // To store date only (YYYY-MM-DD)
        allowNull: false,
    },

    // Optional Note
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // --- System Generated Fields ---
    
    timestamp: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Server will set the time of record creation
        allowNull: false
    }
});







export default Visits;                                   