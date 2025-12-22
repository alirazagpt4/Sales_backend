'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Users table mein column add karein
    await queryInterface.addColumn('Users', 'region', {
      type: Sequelize.STRING,
      allowNull: true, // Shuru mein true rakhein taake existing data mein error na aaye
    });

    // 2. customers table mein column add karein
    await queryInterface.addColumn('customers', 'region', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback ke liye dono columns remove karein
    await queryInterface.removeColumn('Users', 'region');
    await queryInterface.removeColumn('customers', 'region');
  }
};