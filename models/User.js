import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define('User' , {
     id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
     },

    name:{
        type : DataTypes.STRING,
        allowNull: true,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true,
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,

    },
    role:{
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false,

    },
     
});

export default User;