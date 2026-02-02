import { DataTypes } from 'sequelize';
import sequelize from "../config/db.js";

const SaleOrder = sequelize.define('SaleOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    customer_id: {
        type: DataTypes.STRING, // Aapke Visits model ke mutabiq STRING rakha hai
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('new', 'pending', 'completed', 'cancelled'),
        defaultValue: 'new',
    },
    order_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'sale_orders',
    freezeTableName: true,
});

export default SaleOrder;