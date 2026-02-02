module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sale_orders', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      order_no: { type: Sequelize.STRING, allowNull: false, unique: true },
      customer_id: { type: Sequelize.STRING, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      status: { type: Sequelize.ENUM('new', 'pending', 'completed', 'cancelled'), defaultValue: 'new' },
      order_date: { type: Sequelize.DATEONLY, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('sale_orders'); }
};