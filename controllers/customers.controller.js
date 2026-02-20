// import Customers from '../models/customers.model.js';
import { Op } from 'sequelize';
// import City from '../models/City.js';
// import User from '../models/User.js';
import { Customers, User, City } from '../models/associations.js';
import { getFlatIds } from '../herarchy/herarchy.js';
// console.log("Customers Model in Controller:", Customers);

const createCustomer = async (req, res) => {

    const { id, customer_name, contact, area, tehsil, bags_potential, type, city_id, latitude, longitude, district, division, province, region } = req.body;


    try {

        const user_id = req.user.id;

        const existingCustomer = await Customers.findOne({ where: { contact: contact } });



        if (existingCustomer) {

            // CHECK: Agar banane wala wahi purana banda hi hai
            if (existingCustomer.user_id === user_id) {
                return res.status(400).json({
                    error: "You Already Own This Customer , Check your Existing Customer List"
                });
            }


            // 2. Agar mil gaya toh naya record nahi banana, sirf user_id override karni hai
            await existingCustomer.update({ user_id: user_id });

            return res.status(200).json({
                message: "Customer already existed, ownership updated.",
                customer: existingCustomer
            });
        }

        const newCustomer = await Customers.create({
            id: id,
            customer_name: customer_name,
            contact: contact,
            area: area,
            tehsil: tehsil,
            bags_potential: bags_potential,
            type: type,
            city_id, city_id,
            latitude: latitude,
            longitude: longitude,
            district: district,
            division: division,
            province: province,
            region: region,
            user_id: user_id
        });

        if (newCustomer) {
            res.status(201).json({
                message: "Customer created successfully",
                customer: newCustomer
            });
        } else {
            res.status(400).json({
                error: "Failed to create customer"
            }

            );
        }

    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}




const getAllCustomers = async (req, res) => {
    try {
        // 1. Pagination Parameters nikalna
        const page = parseInt(req.query.page) || 1; // Default page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10 records

        // 2. Offset calculate karna
        const offset = (page - 1) * limit;

        const { search } = req.query;
        let whereCondition = {};

        // Search logic jaisa pehle tha
        if (search) {
            whereCondition = {
                [Op.or]: [
                    { customer_name: { [Op.like]: `%${search}%` } },
                    { contact: { [Op.like]: `%${search}%` } },
                    { area: { [Op.like]: `%${search}%` } },
                    { '$userDetails.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // 3. Sequelize.findAndCountAll ka istemaal karein
        const { count, rows: customers } = await Customers.findAndCountAll({
            where: whereCondition,

            // Pagination Options
            limit: limit,
            offset: offset,
            subQuery: false,



            // 🚀 CHANGE 1: City association ko include karein
            include: [{
                model: City, // Aapki City Model
                as: 'cityDetails', // Wohi alias jo association.js mein Customers model ke liye diya tha
                attributes: ['name'], // ⚠️ Yahan 'cityName' ya 'name' jo bhi aapki City table mein naam hai
                required: false // Agar cityId optional hai (NULL ho sakta hai)
            },
            {
                model: User,
                as: 'userDetails', // Jo alias aapne associations mein rakha hai
                attributes: ['name'], // Sirf 'name' chahiye humein
                required: false // LEFT JOIN karega taake agar user_id null ho tab bhi customer dikhe
            }],
        });



        // 4. Total Pages calculate karna
        const totalPages = Math.ceil(count / limit);


        const formattedCustomers = customers.map(customer => ({
            ...customer.toJSON(), // Saare existing fields copy karein

            // City ka Naam direct field
            cityName: customer.cityDetails ? customer.cityDetails.name : 'N/A',
            createdBy: customer.userDetails ? customer.userDetails.name : 'System',

            // customer.cityDetails object ko response se hata dein agar zaroori ho
            cityDetails: undefined,
            userDetails: undefined
        }));

        // 5. Response mein Data aur Pagination Metadata bhejna
        res.status(200).json({
            data: formattedCustomers,
            pagination: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        });

    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



const getAllCustomersByCity = async (req, res) => {
    const user = req.user;
    try {
        const userCityId = user.city_id;
        const loggedInUserId = user.id;


        const customers = await Customers.findAll({
            where: {
                city_id: userCityId,
                user_id: loggedInUserId

            },
            // 🛑 OPTIONAL: Agar aap sirf kuch specific fields chahte hain toh 'attributes' use karein
            attributes: [
                'id',
                'customer_name',
                'contact', // ✅ Contact field zaroor include karein
                'area',
                'tehsil',
                'type',
                'city_id',
                'region',
                'latitude',
                'longitude',
                // Aapke Customer Model ke baaki zaroori fields yahan add karein
            ],
            order: [['customer_name', 'ASC']],
        });

        // 🛑 Frontend Ko Jawab: response.data.customers mein contact available hoga
        return res.status(200).json({
            customers: customers,
        });

    } catch (error) {
        console.error('SERVER ERROR fetching customers by city:', error);
        return res.status(500).json({ message: "Internal server error during data retrieval." });
    }
}


const getTeamCustomers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        
        // 1. Pagination Params (Mobile se page number ayega)
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 20; // Ek waqt mein 20 customers
        const offset = (page - 1) * limit;

        // 2. Hierarchy Fetching (Wahi purani light-weight query)
        const userWithTeam = await User.findByPk(loggedInUserId, {
            include: {
                model: User,
                as: 'subordinates',
                include: {
                    model: User,
                    as: 'subordinates',
                    include: { model: User, as: 'subordinates' }
                }
            }
        });

        const teamIds = userWithTeam ? getFlatIds(userWithTeam) : [loggedInUserId];

        // 3. FindAndCountAll use karein taake total pages pata chal sakein
        const { count, rows: customers } = await Customers.findAndCountAll({
            where: {
                user_id: { [Op.in]: teamIds }
            },
            limit: limit,
            offset: offset,
            include: [
                { model: City, as: 'cityDetails', attributes: ['name'] },
                { model: User, as: 'userDetails', attributes: ['fullname'] }
            ],
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        const totalPages = Math.ceil(count / limit);

        // 4. Response
        res.status(200).json({
            success: true,
            pagination: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit
            },
            teamIds: teamIds,
            data: customers
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getCustomerById = async (req, res) => {
    const customerId = req.params.id;
    try {
        const customer = await Customers.findByPk(customerId);
        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ message: "Customer not found" });
        }
    }
    catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


// Export the controller functions


// Update customer by ID
const updateCustomerById = async (req, res) => {
    const customerId = req.params.id;

    const updatedData = req.body;

    try {
        const customer = await Customers.findByPk(customerId);
        console.log("customer id ", customer)

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // 2. Customer ko update karein
        const [updatedRowsCount] = await Customers.update(updatedData, {
            where: { id: customerId }
        });

        if (updatedRowsCount > 0) {
            const updatedCustomer = await Customers.findByPk(customerId);
            return res.status(200).json({
                "message": "Updated Customer Succesfully",
                "customer": updatedCustomer
            });
        }
        else {
            // Agar customer mil gaya tha, lekin koi data change nahi hua (updatedRowsCount === 0)
            // Toh 200 OK message bhejna chahiye, 400 nahi.
            return res.status(200).json({ message: "No changes made to customer" });
        }



    } catch (error) {
        // ... (Aapka detailed error handling code yahan hai)
        console.error("--- DETAILED UPDATE ERROR ---:", error);

        let statusCode = (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') ? 400 : 500;

        res.status(statusCode).json({
            message: "Update failed due to bad data or constraint issue.",
            details: error.message
        });
    }


};





// Delete customer by ID
const deleteCustomerById = async (req, res) => {
    const customerId = req.params.id;

    try {
        const deletedRows = await Customers.destroy({
            where: { id: customerId }
        });

        console.log("deletedRows", deletedRows);
        if (deletedRows) {
            res.status(200).json({ message: "Customer deleted successfully" });
        }
        else {
            res.status(404).json({ message: "Customer not found" });
        }
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};









export { createCustomer, getAllCustomers, getCustomerById, updateCustomerById, deleteCustomerById, getAllCustomersByCity, getTeamCustomers };  
