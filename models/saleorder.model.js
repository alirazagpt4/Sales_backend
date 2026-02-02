import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SaleOrder = sequelize.define(
  "SaleOrder",
  {
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
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("new", "processing", "dispatched", "delivered", "cancelled"),
      defaultValue: "new",
    },
    order_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sale_orders",
    freezeTableName: true,
    hooks: {
      beforeValidate: async (order, options) => {
        // Agar order_no pehle se nahi hai (jo ke nahi hoga)
        if (!order.order_no) {
          const year = new Date().getFullYear();

          // Sabse bada ID nikalne ke liye
          const lastOrder = await SaleOrder.findOne({
            order: [["id", "DESC"]],
          });

          let nextId = 1;
          if (lastOrder) {
            nextId = lastOrder.id + 1;
          }

          // Yahan order_no set ho raha hai validation se pehle
          order.order_no = `SO-${year}-${String(nextId).padStart(6, "0")}`;
        }
      },
    },
  },
);

export default SaleOrder;
