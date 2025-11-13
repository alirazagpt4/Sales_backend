import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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

        // generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
        );

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


