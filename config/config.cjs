// /config/config.js (Yeh file CLI ke liye hai)
// Ismein sirf woh configuration object hoga jo CLI ko chahiye.

require('dotenv').config(); 
// Ye zaroori hai agar .env file mein variables hain

module.exports = {
  development: {
    username: process.env.DB_USER, 
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql" // Fallback to mysql if not defined
  },
  // production: { ... } // Production settings
};