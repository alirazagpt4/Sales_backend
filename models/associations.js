import User from "./User.js";
import Customers from "./customers.model.js";
import Visits from "./visits.model.js";
import Startday from "./startday.model.js";
import City from "./City.js";

// --- Naye Models Import Karein ---
import Items from "./items.model.js"; 
import SaleOrder from "./saleorder.model.js";
import SaleOrderItem from "./saleorderitems.model.js";

// User and Visits Association
User.hasMany(Visits, { foreignKey: 'user_id', as: 'userVisits' });
Visits.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Customers and Visits Association
Customers.hasMany(Visits, { foreignKey: 'customer_id', as: 'customerVisits' });
Visits.belongsTo(Customers, { foreignKey: 'customer_id', as: 'customer' });


// User and Startday Association
User.hasMany(Startday, { foreignKey: 'user_id', as: 'startdays' });
Startday.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


// user and city relation
User.belongsTo(City , {
    foreignKey: 'city_id',
        as: 'cityDetails'
});

City.hasMany(User , {
    foreignKey:'city_id'
});

Customers.belongsTo(City , {
    foreignKey:'city_id',
    as : 'cityDetails'
});

City.hasMany(Customers , {
    foreignKey:'city_id',
    as : 'cityDetails'
});

User.hasMany(Customers , {
    foreignKey:'user_id'
})


Customers.belongsTo(User,{
    foreignKey:'user_id',
    as: 'userDetails'
})


// 1. SaleOrder aur User (Kis user ne order banaya)
User.hasMany(SaleOrder, { foreignKey: 'user_id', as: 'userOrders' });
SaleOrder.belongsTo(User, { foreignKey: 'user_id', as: 'userDetails' });

// 2. SaleOrder aur Customer (Kis customer ka order hai)
Customers.hasMany(SaleOrder, { foreignKey: 'customer_id', as: 'customerOrders' });
SaleOrder.belongsTo(Customers, { foreignKey: 'customer_id', as: 'customerDetails' });

// 3. SaleOrder aur SaleOrderItem (Master-Detail Relation)
// Jab order delete ho, to uske saare items bhi delete ho jayein (onDelete: 'CASCADE')
SaleOrder.hasMany(SaleOrderItem, { 
    foreignKey: 'order_id', 
    as: 'items', 
    onDelete: 'CASCADE' 
});
SaleOrderItem.belongsTo(SaleOrder, { foreignKey: 'order_id' });

// 4. SaleOrderItem aur Items (Har row mein kaunsa item hai)
Items.hasMany(SaleOrderItem, { foreignKey: 'item_id' });
SaleOrderItem.belongsTo(Items, { foreignKey: 'item_id', as: 'itemDetails' });


// Export mein bhi add kar dein
const models = { User, Customers, Visits, Startday, City, Items, SaleOrder, SaleOrderItem };
export { User, Customers, Visits, Startday, City, Items, SaleOrder, SaleOrderItem };
export default models;


// export { User, Customers, Visits, Startday , City};
// const models = { User, Customers, Visits, Startday, City };
// export { User, Customers, Visits, Startday, City };
// export default models;