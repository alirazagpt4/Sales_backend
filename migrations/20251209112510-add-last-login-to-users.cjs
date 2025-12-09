module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'last_login', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null // Jab tak user login nahi karta, yeh null rahega
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'last_login');
  }
};
// Phir migration run karein: npx sequelize db:migrate