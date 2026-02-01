import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    notNull: true,
  },
  item_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,

  }
});

export default Item;
