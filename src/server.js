import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

dotenv.config();


const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use(`/api/${process.env.VERSION}/auth`, authRoutes);
app.use(`/api/${process.env.VERSION}/plant`, plantRoutes);
app.use(`/api/${process.env.VERSION}/shop`, shopRoutes);

app.listen(process.env.PORT || 3000, () => {    
    console.log('Server is running on port ' + (process.env.PORT || 3000));
});