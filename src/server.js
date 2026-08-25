import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

import './cron/plantDegrader.js';

dotenv.config();


const app = express();

app.use(helmet());

const limiter= rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.', 
})

app.use('/api', limiter);


app.use(express.json({limit : '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000', 'http://192.168.12.77:3000'],
    credentials: true,

}));

app.use(`/api/${process.env.VERSION}/auth`, authRoutes);
app.use(`/api/${process.env.VERSION}/plant`, plantRoutes);
app.use(`/api/${process.env.VERSION}/shop`, shopRoutes);
app.use('/test', (req, res) => {
    console.log('Test route hit');
    res.send('Test route is working');
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
    })
})

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: 'Database Error',
      message: 'A database error occurred. Please try again.'
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again later.'
      : err.message
  });
});

const port= process.env.PORT || 3000;
app.listen(port, () => {    
    console.log('Server is running on port ' + port);
});