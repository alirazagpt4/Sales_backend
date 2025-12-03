import { DataTypes } from 'sequelize'; 
import sequelize from "../config/db.js"; 
import Visits from './visits.model.js';

const Customers = sequelize.define('Customers', {
    id: {
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    customer_name: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    area: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tehsil: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bags_potential:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('Farmer', 'Dealer'),
        allowNull: false,
    },
    // Removing 'purpose' and 'date' from here (as per recommendation to keep them in Visit)
});


// 2. Association define karein
Customers.hasMany(Visits, {
    foreignKey: 'customer_id', // Visits table mein jo foreign key hai
    as: 'visits'             // Jab data fetch karenge toh kis naam se aayega
});

// Export default if using ES Modules
// export default Customer;

export default Customers;