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
        type: DataTypes.ENUM('New', 'Mature' , 'Old'),
        allowNull: true
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

  
},{ // <-- Yahan options object shuru hota hai
    tableName: 'visits',       // Force chote harfon wala table name
    freezeTableName: true,     // Sequelize ko Model ka naam plural banane se rokein
});







export default Visits;                                   