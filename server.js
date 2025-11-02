import express from 'express';
import 'dotenv/config';
import connectDB from './database/db.js';
import userRoute from './routers/userRoute.js';
import cors from 'cors';


 
const app = express();  
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Adjust according to your frontend's address
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use('/api/v1/user', userRoute);  




app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port:${PORT}`);
});


