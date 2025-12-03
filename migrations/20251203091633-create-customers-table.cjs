
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Customers table banane ka code
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,     
        primaryKey: true,
        allowNull: false,
      },
      customer_name: { 
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact: { 
        type: Sequelize.STRING,
        allowNull: false,
      },
      area: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tehsil: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bags_potential: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('Farmer', 'Dealer'),
        allowNull: false,
      },
      // Sequelize timestamps fields
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Migration undo karne par yeh table delete ho jayegi
    await queryInterface.dropTable('customers');
  }
};