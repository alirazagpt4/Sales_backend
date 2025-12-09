import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
dotenv.config();


export const createUser = async (req, res) => {
    try {
        const { name , email , password , role} = req.body;

        // console.log("body :::",req.body);

        // Validation checks
        if(!name || !email || !password){
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email}});

        if(existingUser){
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);


        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
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
        const { email , password} = req.body;
        
        // Validation checks
        if(!email || !password){
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // find user by email
        const user = await User.findOne({ where: { email }});

        if(!user){
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(password , user.password);

        if(!isPasswordValid){
            return res.status(401).json({ error: 'Invalid email or password.' });
        }


        // ⭐ YAHAN CHANGE KAREIN ⭐
        // 1. last_login update karna
        user.last_login = new Date(); // Current date aur time set ho jayega
        await user.save();           // Database mein record save hoga (Update query chalegi)
        // ⭐ ******************** ⭐

        // generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
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
                role: user.role
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
   
    const { email, password } = req.body;
    
    // 1. User ko email se dhoondhein
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. CHECK: Ensure user ka role 'admin' hai
    if (user.role !== 'admin') {
        // Agar user exist karta hai, lekin admin nahi hai
        return res.status(403).json({ message: 'Access denied: Not an administrator' });
    }

    // 3. Admin user ke liye JWT generate karein
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );
    
    res.json({ token });
};





export const getAllUsers = async (req, res) => {
    try {
        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
            attributes: ['id', 'name', 'email', 'role', 'createdAt'] // Exclude password
        });

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



export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

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






