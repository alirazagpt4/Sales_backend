import { SaleOrder, SaleOrderItem, Items, User, Customers } from "../models/associations.js";
import sequelize from "../config/db.js";

export const createSaleOrder = async (req, res) => {
    // Step 1: Transaction start
    const user_id = req.user.id; 
    const { customer_id, items } = req.body; // total_amount ab req se nahi lenge
    const t = await sequelize.transaction();
    
    try {

        // --- Step 2: Auto Calculate Total Amount ---
        let finalTotalAmount = 0;
        const processedItems = items.map(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            finalTotalAmount += itemSubtotal;
            return {
                item_id: item.item_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: itemSubtotal
            };
        });

        // --- Step 3: Master Table (SaleOrder) Create ---
        // 'order_no' Model ke beforeValidate hook se khud banega
        const order = await SaleOrder.create({
            customer_id,
            user_id,
            total_amount: finalTotalAmount, // Hamari apni calculation
            order_date: new Date()
        }, { transaction: t });

        // --- Step 4: Items mein Order ID link karein ---
        const itemsWithOrderId = processedItems.map(item => ({
            ...item,
            order_id: order.id
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
            message: "Order placed successfully!"
        });

    } catch (err) {
        // Error anay par rollback (Khatarnak: data aadha save nahi hoga)
        await t.rollback();
        console.error("Order Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};