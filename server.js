import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
import sequelize from'./config/db.js';
import salesRoutes from './routes/sales.js';
// import User from './models/User.js';
import userRoutes from './routes/user.routes.js';
import startdayRoutes from './routes/startday.routes.js';
import customersRoutes from './routes/customers.routes.js';
import './models/associations.js';




const app = express();
const PORT = process.env.PORT || 5000;
// Middleware 
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.get('/' , (req , res) =>{
     res.json({
        message : "Sales App is Running perfectly"
     })
});

app.use('/api/users' , userRoutes);

app.use('/api' , startdayRoutes);
app.use('/api/customers' , customersRoutes);

(async () =>{
try {
    await sequelize.authenticate()
    // await sequelize.sync()
    // .then(()=> console.log("user table ready"))
    // .catch((err) => console.log("Error creating table:", err));
    
    console.log('Database connected successfully.');

    app.listen(PORT , ()=>{
        console.log(`Server is running on port ${PORT}`);
    })
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
})();

