import express from 'express';
// console.log("Starting server..." , express);
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
import visitsRoutes from './routes/visits.routes.js'
import kpisRoutes from './routes/kpis.routes.js';
import reportsRoutes from './routes/report.routes.js';
import './models/associations.js';
import citiesRoutes from './routes/cities.routes.js';
import path from 'path';



const app = express();
const PORT = process.env.PORT || 5000;
// Middleware 
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(path.resolve(), 'public')));
app.use('/public', express.static(path.join(process.cwd(), 'uploads')));


app.get('/' , (req , res) =>{
     res.json({
        message : "Sales App is Running perfectly"
     })
});

app.use('/api/users' , userRoutes);
app.use('/api' , startdayRoutes);
app.use('/api/customers' , customersRoutes);
app.use('/api/visits' , visitsRoutes);
app.use('/api' , kpisRoutes);
app.use('/api',reportsRoutes);
app.use('/api/cities' , citiesRoutes);





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

