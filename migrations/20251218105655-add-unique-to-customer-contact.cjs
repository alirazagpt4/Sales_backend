'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('customers', 'contact', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true // 👈 Yeh database mein shart lagaye ga
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('customers', 'contact', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false
    });
  }
};