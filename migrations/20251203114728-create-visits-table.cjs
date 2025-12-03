'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      
      // --- FOREIGN KEY TO CUSTOMERS ---
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers', // Customers table ka naam
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // --- FOREIGN KEY TO USERS (Assuming 'users' table exists) ---
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Users table ka naam
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      purpose: {
        type: Sequelize.ENUM('Visit', 'Mature', 'Complaint', 'Collection'), // Purpose ke options
        allowNull: false,
      },
      
      date: {
        type: Sequelize.DATEONLY, // Date ko sirf date ke format mein rakhte hain
        allowNull: false,
      },
      
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },

      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('visits');
  }
};