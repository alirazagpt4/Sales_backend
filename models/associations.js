import User from "./User.js";
import Customers from "./customers.model.js";
import Visits from "./visits.model.js";
import Startday from "./startday.model.js";
import City from "./City.js";

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

export { User, Customers, Visits, Startday , City};