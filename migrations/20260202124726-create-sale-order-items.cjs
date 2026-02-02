'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sale_order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Ye line SaleOrder table se link kar rahi hai
        references: {
          model: 'sale_orders', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Agar main order delete ho toh items bhi urr jayein
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Agar aapka items table ka naam 'items' hai toh niche wali lines uncomment kar sakte hain
        /*
        references: {
          model: 'items',
          key: 'id'
        }
        */
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sale_order_items');
  }
};