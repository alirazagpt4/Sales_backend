import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import City from '../models/City.js';
dotenv.config();


export const createUser = async (req, res) => {
    try {
        const { name  , password , role , city_id , designation , fullname , mobile_ph , whatsapp_ph , region} = req.body;

        console.log("body :::",req.body);

        // Validation checks
        if(!name ||   !password || !city_id || !designation ||   !fullname || !mobile_ph ||  !whatsapp_ph || !region){
            return res.status(400).json({ error: 'all fields are required are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { name}});

        if(existingUser){
            return res.status(409).json({ error: 'User with this name already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);


        // Create new user
        const newUser = await User.create({
            name,
            password: hashedPassword,
            role,
            city_id,
            designation,
            fullname,
            mobile_ph,
            whatsapp_ph,
            region
        });



        res.status(201).json({ message: 'User created successfully'});

    }
    catch (err){
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const loginUser = async (req , res) =>{
    try{
        const { name , password} = req.body;
        
        // Validation checks
        if(!name || !password){
            return res.status(400).json({ error: 'Name and password are required.' });
        }

        console.log("login req body . . .  .. . . . . . . . . . . . . . in login request  " , req.body);


        // find user by email
        const user = await User.findOne({ where: { name }});

        if(!user){
            return res.status(401).json({ error: 'Invalid name or password.' });
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(password , user.password);

        if(!isPasswordValid){
            return res.status(401).json({ error: 'Invalid name or password.' });
        }


        // ⭐ YAHAN CHANGE KAREIN ⭐
        // 1. last_login update karna
        user.last_login = new Date(); // Current date aur time set ho jayega
        await user.save();           // Database mein record save hoga (Update query chalegi)
        // ⭐ ******************** ⭐

        // generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role , name:user.name , city_id:user.city_id },
            process.env.JWT_SECRET,
        );


        res.cookie('token', token);

        res.status(200).json({
            message: 'Login successful',
            token,
            user:{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city_id:user.city_id
            }
        });



    }
    catch(err){
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// Admin login
export const loginAdmin = async (req , res) =>{
   
    const { name, password } = req.body;
    
    // 1. User ko email se dhoondhein
    const user = await User.findOne({ where: { name } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. CHECK: Ensure user ka role 'admin' hai
    if (user.role !== 'admin' && user.role !== 'superadmin') {
        // Agar user exist karta hai, lekin admin nahi hai
        return res.status(403).json({ message: 'Access denied: Not an administrator' });
    }

    const username = user.name;
    const fullname = user.fullname;
    const userRole = user.role;
    console.log("username and full name ..." ,username , fullname , userRole);

    // 3. Admin user ke liye JWT generate karein
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );
    
    res.json({ token , username , fullname , userRole});
};





export const getAllUsers = async (req, res) => {
    try {
        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const offset = (page - 1) * limit;

        // Search setup
        const search = req.query.search;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { role: { [Op.like]: `%${search}%` } }
            ];
        }

        // Fetch users and count
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            attributes: ['id', 'name', 'email', 'role', 'createdAt','designation' , 'city_id' , 'fullname' , 'mobile_ph' , 'whatsapp_ph' , 'region'], // Exclude password
            include: [{
                model: City, // Ya models.City (jo bhi import kiya ho)
                as: 'cityDetails', // Wohi alias jo association.js mein diya tha
                attributes: ['name'], // Sirf City ka Naam chahiye
                required: false // Left join use hoga
            }],      
        });



        // 🔑 DATA MAPPING: Response ko flatten karna (City Name ko direct field banana)
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            designation: user.designation,
            fullname: user.fullname,
            mobile_ph:user.mobile_ph,
            whatsapp_ph:user.mobile_ph,
            region:user.region,
            
            // 🔑 City ka Naam direct field
            cityName: user.cityDetails ? user.cityDetails.name : 'N/A', 
            
            // Agar phir bhi ID chahiye to yahan rakh sakte hain
            city_id: user.city_id 
        }));
        //

        res.status(200).json({
            totalUsers: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            users,
        });

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const viewUser = async (req , res) =>{
    try {
        const { id } = req.params; // ID ko URL parameters se nikalna (e.g., /users/5)

        // User data ko ID aur associations ke saath fetch karna
        const user = await User.findByPk(id, {
            // 🔑 Naye fields ke saath attributes define karein
            attributes: [
                'id', 
                'name', 
                'email', 
                'role', 
                'createdAt',
                'designation',  
                'last_login',
                'fullname',
                'mobile_ph',
                'whatsapp_ph',
                'region', // Agar aapne yeh field add kiya tha
            ],
            
            // 🔑 City ka Naam laane ke liye include/association use karein
            include: [{
                model: City, 
                as: 'cityDetails', // Wohi alias jo association.js mein diya tha
                attributes: ['name'], 
                required: false // Agar City ID null ho to crash na ho
            }],
        });

        // Agar user nahi milta
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 🔑 Data ko Flatten karna (City Name ko direct field banana)
        // User object ko simple JSON mein convert karein
        const userData = user.toJSON(); 
        
        // City ka Naam nikal kar direct field bana dein
        const formattedUser = {
            ...userData,
            cityName: userData.cityDetails ? userData.cityDetails.name : 'N/A',
            city_id: userData.city_id, // City ID bhi rakh sakte hain
        };
        
        // Association object ko final response se hata dein (clean-up)
        delete formattedUser.cityDetails;


        res.status(200).json({
            message: 'User details fetched successfully',
            user: formattedUser
        });

    } catch (err) {
        console.error(`Error fetching user ID ${req.params.id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
} 



export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role , city_id , designation , fullname , mobile_ph , whatsapp_ph , region} = req.body;

        console.log("update ''''''''' user data" , req.body);
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        // Hash new password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if(city_id) updateData.city_id = city_id;
        if(designation) updateData.designation = designation;
        if(fullname) updateData.fullname = fullname;
        if(mobile_ph) updateData.mobile_ph = mobile_ph;
        if(whatsapp_ph) updateData.whatsapp_ph = whatsapp_ph;
        if(region) updateData.region = region;

        await user.update(updateData);

        res.status(200).json({ message: 'User updated successfully' });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}





export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await User.destroy({
            where: { id }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully' });

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}






