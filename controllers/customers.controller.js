import Customers from '../models/customers.model.js';
import { Op } from 'sequelize';

// console.log("Customers Model in Controller:", Customers);

const createCustomer = async (req ,res) =>{

    const { id , customer_name, contact, area, tehsil, bags_potential, type } = req.body;


    try{

        const newCustomer = await Customers.create({
            id: id,
            customer_name: customer_name,
            contact: contact,
            area: area,
            tehsil: tehsil,
            bags_potential: bags_potential,
            type: type

        });

        if(newCustomer){
            res.status(201).json({
                message: "Customer created successfully",
                customer: newCustomer
            });
        }else{
            res.status(400).json({
                error: "Failed to create customer"  
        }
           
        );
        }

    }catch(error){
        console.error("Error creating customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}




const getAllCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let whereCondition = {};

        // Agar search keyword maujood ho, toh WHERE condition tayyar karein
        if (search) {
            // Sequelize Op.or use karke customer_name, contact, ya area mein search karein
            whereCondition = {
                [Op.or]: [
                    { customer_name: { [Op.like]: `%${search}%` } },
                    { contact: { [Op.like]: `%${search}%` } },
                    { area: { [Op.like]: `%${search}%` } }
                ]
            };
        }


        const  customers = await Customers.findAll({
            where: whereCondition
        });
        res.status(200).json(customers);
        
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


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
        console.log("customer id " , customer)

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // 2. Customer ko update karein
        const [updatedRowsCount] = await Customers.update(updatedData, {
            where: { id: customerId }
        });

        if(updatedRowsCount > 0){
            const updatedCustomer = await Customers.findByPk( customerId);
            return res.status(200).json({
                "message":"Updated Customer Succesfully",
                "customer": updatedCustomer
            });
        }
        else{
            // Agar customer mil gaya tha, lekin koi data change nahi hua (updatedRowsCount === 0)
            // Toh 200 OK message bhejna chahiye, 400 nahi.
            return res.status(200).json({ message: "No changes made to customer" });
        }


        
    }catch (error) {
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

        console.log("deletedRows" , deletedRows);
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









export { createCustomer, getAllCustomers  , getCustomerById , updateCustomerById, deleteCustomerById };  
