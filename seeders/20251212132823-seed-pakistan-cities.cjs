// [timestamp]-seed-pakistan-cities.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Cities', [
      // --- Major Metros ---
      { name: 'Karachi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lahore', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Faisalabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rawalpindi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Islamabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Multan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hyderabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gujranwala', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Peshawar', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sialkot', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Quetta', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sargodha', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bahawalpur', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Abbottabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukkur', createdAt: new Date(), updatedAt: new Date() },

      // --- 🚀 Image wali Tehsils (Missing Cities) ---
      { name: 'Gojra', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kamalia', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Silanwali', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jhang', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dunya Pur', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rahim Yar Khan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Layyah', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Narowal', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nowshehra Wirkan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pindi Bhattian', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sahiwal', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Delete only these specific cities if you want to undo
    await queryInterface.bulkDelete('Cities', null, {});
  }
};