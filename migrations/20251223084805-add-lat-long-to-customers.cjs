'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'latitude');
    await queryInterface.removeColumn('customers', 'longitude');
  }
};