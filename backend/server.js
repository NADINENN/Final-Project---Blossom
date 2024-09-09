const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./dbConnection'); 

// Import route modules
const userRoutes = require('./users');
const exerciseRoutes = require('./exercises');
const progressRoutes = require('./progress');

// Config
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Check database connection
db.getConnection()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
