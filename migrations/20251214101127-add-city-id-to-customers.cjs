'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // customers table mein 'cityId' column aur Foreign Key add karna.
    await queryInterface.addColumn('customers', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Agar City select karna optional hai
      
      // Foreign Key Constraint
      references: {
        model: 'cities', // ⚠️ Yahan aapki City master table ka sahi naam aayega
        key: 'id',
      },
      onUpdate: 'CASCADE', // Jab Cities table mein ID update ho
      onDelete: 'SET NULL' // Jab City delete ho, toh customer ki cityId NULL ho jaye
    });
  },

  async down (queryInterface, Sequelize) {
    // Migration revert karne ke liye 'cityId' column remove karna.
    await queryInterface.removeColumn('customers', 'city_id');
  }
};