import express from 'express';
import 'dotenv/config';
import connectDB from './database/db.js';
import userRoute from './routers/userRoute.js';

 
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use('/api/v1/user', userRoute);  

//http://localhost:8000/api/v1/user/register"


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port:${PORT}`);
});
