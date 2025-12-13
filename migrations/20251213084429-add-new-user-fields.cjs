'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // 1. Missing mobile fields add karein (Temporarily allowNull: true)
    // Abhi hum sirf woh columns add kar rahe hain jo missing hain.
    
    // Mobile Phone
    await queryInterface.addColumn('Users', 'mobile_ph', {
      type: Sequelize.STRING,
      allowNull: true, // PEHLE TRUE
      unique: true,
    });
    
    // Whatsapp Phone
    await queryInterface.addColumn('Users', 'whatsapp_ph', {
      type: Sequelize.STRING,
      allowNull: true, // PEHLE TRUE
      unique: true,
    });

    // 2. Data Populate (CRUCIAL STEP for existing users)
    // Mobile/Whatsapp ke liye 'id' ka use karke unique value set karein
    // Aur fullname ko bhi 'name' se set karein agar woh NULL hai.
    // NOTE: MySQL/Postgres compatibility ke liye table name ko quotes mein nahi rakha gaya hai
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET 
        fullname = name, 
        mobile_ph = id + 9000000000, 
        whatsapp_ph = id + 9000000000 
      WHERE 
        mobile_ph IS NULL OR whatsapp_ph IS NULL;
    `);

    // 3. Final Constraints apply karein (changeColumn use karke allowNull: false set karein)
    
    // mobile_ph (Ab required/NOT NULL set hoga)
    await queryInterface.changeColumn('Users', 'mobile_ph', {
        type: Sequelize.STRING,
        allowNull: false, // AB FALSE
        unique: true,
    });
    
    // whatsapp_ph (Ab required/NOT NULL set hoga)
    await queryInterface.changeColumn('Users', 'whatsapp_ph', {
        type: Sequelize.STRING,
        allowNull: false, // AB FALSE
        unique: true,
    });
    
    // fullname (Agar yeh pehle add ho chuka hai lekin constraint pending hai)
    await queryInterface.changeColumn('Users', 'fullname', {
        type: Sequelize.STRING,
        allowNull: false, // AB FALSE
    });
    
    // Optional: 'name' ko allowNull:true set karein agar pending ho
    await queryInterface.changeColumn('Users', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback changes (Agar zaroorat ho)
    await queryInterface.removeColumn('Users', 'whatsapp_ph');
    await queryInterface.removeColumn('Users', 'mobile_ph');
    // NOTE: Hum 'fullname' ko remove nahi kar rahe hain kyunki woh pichli migration se aaya tha.
    
    // Agar mobile aur whatsapp ki constraints wapas allowNull:true karni ho
    // await queryInterface.changeColumn('Users', 'mobile_ph', { type: Sequelize.INTEGER, allowNull: true });
  }
};