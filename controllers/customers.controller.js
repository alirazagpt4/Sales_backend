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





export { createCustomer, getAllCustomers  , getCustomerById };  