import Customers from '../models/customers.model.js';

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


export { createCustomer };