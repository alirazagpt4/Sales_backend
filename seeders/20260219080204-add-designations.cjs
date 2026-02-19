'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Exact designations from your provided image
    const designations = [
      { designation: 'Sales Executive', createdAt: new Date(), updatedAt: new Date() },
      { designation: 'Senior Sales Executive', createdAt: new Date(), updatedAt: new Date() },
      { designation: 'Territory Manager', createdAt: new Date(), updatedAt: new Date() },
      { designation: 'Area Sales Manager', createdAt: new Date(), updatedAt: new Date() },
      { designation: 'Zonal Sales Manager', createdAt: new Date(), updatedAt: new Date() },
      { designation: 'Business Development Manager', createdAt: new Date(), updatedAt: new Date() }
    ];

    return queryInterface.bulkInsert('Designations', designations, {});
  },

  async down(queryInterface, Sequelize) {
    // Reverse logic: Table khali karne ke liye
    return queryInterface.bulkDelete('Designations', null, {});
  }
};