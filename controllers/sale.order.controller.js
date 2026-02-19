import {
  SaleOrder,
  SaleOrderItem,
  Items,
  User,
  Customers,
} from "../models/associations.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

export const createSaleOrder = async (req, res) => {
  // Step 1: Transaction start
  const user_id = req.user.id;
  const { customer_id, items } = req.body; // total_amount ab req se nahi lenge
  const t = await sequelize.transaction();

  try {
    // --- Step 2: Auto Calculate Total Amount ---
    let finalTotalAmount = 0;
    const processedItems = items.map((item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      finalTotalAmount += itemSubtotal;
      return {
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: itemSubtotal,
      };
    });

    // --- Step 3: Master Table (SaleOrder) Create ---
    // 'order_no' Model ke beforeValidate hook se khud banega
    const order = await SaleOrder.create(
      {
        customer_id,
        user_id,
        total_amount: finalTotalAmount, // Hamari apni calculation
        order_date: new Date(),
      },
      { transaction: t },
    );

    // --- Step 4: Items mein Order ID link karein ---
    const itemsWithOrderId = processedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    // --- Step 5: Bulk Create Items ---
    await SaleOrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    // Step 6: Sab theek hai toh save kar do (Commit)
    await t.commit();

    // Response mein order_no aur final amount bhej dein
    res.status(201).json({
      success: true,
      order_no: order.order_no,
      total_amount: finalTotalAmount,
      message: "Order placed successfully!",
    });
  } catch (err) {
    // Error anay par rollback (Khatarnak: data aadha save nahi hoga)
    await t.rollback();
    console.error("Order Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getAllSaleOrders = async (req, res) => {
//   try {
//     const orders = await SaleOrder.findAll({
//       include: [{
//         model: Customers,
//         as: 'customerDetails'
//       },
//     {
//         model: User,
//         as: 'userDetails'
//     },
// {
//         model: SaleOrderItem,  
//         as: 'items',
//         include: [{
//             model: Items,
//             as: 'itemDetails'
//         }]  
// }], // Ye SQL ka 'LEFT JOIN' khud hi laga dega
//     });



//     res.status(200).json(orders);
//     console.log("All sale orders : ",orders);

//   } catch (error) {
//     console.error("Error fetching sale orders:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


export const getAllSaleOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await SaleOrder.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true, 
            // --- FIX 1: Ye line sabse zaroori hai ---
            subQuery: false,
            order: [['createdAt', 'DESC']],
            
            // --- 1. Sirf wahi mangwao jo Master Table mein chahiye ---
            attributes: ['id', 'order_no', 'total_amount', 'status', 'order_date'],

            where: {
                [Op.or]: [
                    { order_no: { [Op.like]: `%${search}%` } },
                    { '$customerDetails.customer_name$': { [Op.like]: `%${search}%` } }
                ]
            },

            include: [
                {
                    model: Customers,
                    as: 'customerDetails',
                    // --- 2. Customer ka sirf naam aur contact ---
                    attributes: ['customer_name', 'contact'] 
                },
                {
                    model: User,
                    as: 'userDetails',
                    // --- 3. Sales person ka sirf naam ---
                    attributes: ['name'] 
                },
                {
                    model: SaleOrderItem,
                    as: 'items',
                    // --- 4. Order items ki specific details ---
                    attributes: ['quantity', 'unit_price', 'subtotal'],
                    include: [
                        {
                            model: Items,
                            as: 'itemDetails',
                            // --- 5. Item ka sirf asli naam ---
                            attributes: ['item_name']
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            success: true,
            total: count,
            orders: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};