import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const City = sequelize.define('City', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
    // Sequelize automatically createdAt aur updatedAt add kar dega
  }, {
    // Agar aap chahte hain ki table ka naam 'Cities' hi rahe, 'City' na bane
    freezeTableName: true, 
    tableName: 'cities',
  });

  export default City;