// [timestamp]-add-fields-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. city_id (Foreign Key)
    await queryInterface.addColumn('Users', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Agar city optional ho
      references: {
        model: 'Cities', // Is table se link
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 2. designation
    await queryInterface.addColumn('Users', 'designation', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 3. referred_to
    await queryInterface.addColumn('Users', 'referred_to', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'city_id');
    await queryInterface.removeColumn('Users', 'designation');
    await queryInterface.removeColumn('Users', 'referred_to');
  }
};