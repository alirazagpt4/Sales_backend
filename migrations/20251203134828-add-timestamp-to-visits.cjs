// YYYYMMDDHHMMSS-add-timestamp-to-visits.cjs file mein

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('visits', 'timestamp', { // Note: Table name 'visits' chote harfon mein use karein
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Default value set karein
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('visits', 'timestamp');
  }
};