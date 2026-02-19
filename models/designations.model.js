import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Designation = sequelize.define("Designation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false, // yahan notNull ki jagah allowNull use hota hai sequelize mein
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }
}, {
    timestamps: true, // createdAt aur updatedAt ke liye
});

export default Designation;