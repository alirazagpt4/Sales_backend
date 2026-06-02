'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 🔴 Visits table ke purpose column ko update kar rahe hain naye ENUM values ke sath
    await queryInterface.changeColumn('visits', 'purpose', {
      type: Sequelize.ENUM('New', 'Mature', 'Old', 'NewPotentialCustomer'),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 🔴 Rollback logic: Agar migration wapas leni pare, toh naya option nikal dega
    // Note: Rollback se pehle dhyan rakhna ke DB mein 'NewPotentialCustomer' ka data na ho, warna crash karega
    await queryInterface.changeColumn('visits', 'purpose', {
      type: Sequelize.ENUM('New', 'Mature', 'Old'),
      allowNull: true
    });
  }
};