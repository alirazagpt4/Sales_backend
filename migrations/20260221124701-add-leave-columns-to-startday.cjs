'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. is_leave column add karna
    await queryInterface.addColumn('Startdays', 'is_leave', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // 2. status column add karna
    await queryInterface.addColumn('Startdays', 'status', {
      type: Sequelize.ENUM('PRESENT', 'LEAVE'),
      defaultValue: 'PRESENT',
      allowNull: false
    });

    // 3. startReading ko allowNull: true karna (Modifying existing column)
    await queryInterface.changeColumn('Startdays', 'startReading', {
      type: Sequelize.STRING,
      allowNull: true // 👈 Ye zaroori hai leave ke liye
    });

    // 4. location columns ko bhi allowNull: true karna
    await queryInterface.changeColumn('Startdays', 'location_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.changeColumn('Startdays', 'location_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Agar rollback karna paray toh columns wapas khatam karna
    await queryInterface.removeColumn('Startdays', 'is_leave');
    await queryInterface.removeColumn('Startdays', 'status');
    // Note: status drop karte waqt ENUM ka masla ho sakta hai production mein
  }
};