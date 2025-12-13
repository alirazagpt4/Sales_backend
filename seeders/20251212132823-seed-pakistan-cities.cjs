// [timestamp]-seed-pakistan-cities.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Pakistan ke Top Cities aur kuch zaroori regional centers shamil kiye gaye hain
    await queryInterface.bulkInsert('Cities', [
      // Major Metros (Bade Shehar)
      { name: 'Karachi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lahore', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Faisalabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rawalpindi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Islamabad', createdAt: new Date(), updatedAt: new Date() },
      
      // Punjab aur Sindh ke Doosre Shehar
      { name: 'Multan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hyderabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gujranwala', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Peshawar', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sialkot', createdAt: new Date(), updatedAt: new Date() },
      
      // Regional Cities
      { name: 'Quetta', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sargodha', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bahawalpur', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Abbottabad', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukkur', createdAt: new Date(), updatedAt: new Date() },

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Cities', null, {});
  }
};