'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Designation Link
    await queryInterface.addColumn('Users', 'designationId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Designations', // Table name jis se link karna hai
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // 2. Report To (Hierarchy) - Users table ka apne sath link
    await queryInterface.addColumn('Users', 'reportTo', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users', // Self-reference (Manager ki ID)
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'designationId');
    await queryInterface.removeColumn('Users', 'reportTo');
  }
};