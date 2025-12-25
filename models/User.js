import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

import Visits from "./visits.model.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    notNull: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "user"),
    defaultValue: "user",
    allowNull: false,
  },
  last_login: {
    type: DataTypes.DATE, // DataType DATE hona chahiye
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true, // Agar optional hai
  },
  referred_to: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Foreign Key reference yahan nahi dete, woh sirf association mein hota hai
  },
  mobile_ph: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  whatsapp_ph: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// 2. Association define karein
User.hasMany(Visits, {
  foreignKey: "user_id", // Visits table mein jo foreign key hai
  as: "visits", // Jab data fetch karenge toh kis naam se aayega
});
export default User;
