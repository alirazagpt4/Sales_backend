import { DataTypes } from 'sequelize';
import sequelize from "../config/db.js";

const SaleOrderItem = sequelize.define('SaleOrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references hum associations.js mein handle karenge
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    }
}, {
    tableName: 'sale_order_items',
    freezeTableName: true,
});

export default SaleOrderItem;